from flask import Flask, jsonify, request, abort
import json
from rule.parser_utils import Parser, tokenize
from rule.ast_utils import ANDOperator, Condition, Node, AST, OROperator, solve
from rule import models, database
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dependency for obtaining the database session
def get_db():
    db = None
    try:
        db = models.SessionLocal()
        return db
    except SQLAlchemyError as e:
        abort(500, description=f"Database connection error: {str(e)}")

    finally:
        if db is not None:
            db.close()

# Error handler for 500 errors
@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": str(error)}), 500

# Error handler for 404 errors
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found"}), 404

@app.route("/create_rule", methods=["POST"])
def create_rule():
    try:
        data = request.json
        rule_string = data.get('rule')
        name = data.get('name')
        db = get_db()
        
        tokens = tokenize(rule_string)
        parser = Parser(tokens)
        root = parser.parse()
        
        ast_json = root_to_json(root)
        database.create_rule(db, name, ast_json)
        
        return jsonify(json.loads(ast_json)), 200
    except SQLAlchemyError as e:
        abort(500, description=f"Database error: {str(e)}")
    except Exception as e:
        abort(400, description=f"Error creating rule: {str(e)}")

@app.route("/combine_rules", methods=["POST"])
def combine_rules():
    try:
        data = request.json
        rule_list = data.get('rules')
        combined_root = None
        
        for rule in rule_list:
            tokens = tokenize(rule)
            parser = Parser(tokens)
            root = parser.parse()
            
            if combined_root is None:
                combined_root = root
            else:
                combined_root = Node(
                    node_type="operator",
                    left=combined_root,
                    right=root,
                    value=ANDOperator()
                )
        
        return jsonify(json.loads(root_to_json(combined_root))), 200
    except Exception as e:
        abort(400, description=f"Error combining rules: {str(e)}")


@app.route("/check_rule", methods=["POST"])
def check_rule():
    try:
        data = request.json
        
        rule_name = data.get('rule_name')
        
        db = get_db()
        
        db_rule = database.get_rule_by_name(db, rule_name)
        
        if db_rule is None:
            return []
        
        data = json.loads(db_rule.ast_json)
        labels = solve(data)
        
        return labels, 200
    except SQLAlchemyError as e:
        abort(500, description=f"Database error: {str(e)}")
    except Exception as e:
        abort(400, description=f"Error checking rule existence: {str(e)}")

@app.route("/evaluate_rule", methods=["POST"])
def evaluate_rule():
    try:
        
        data = request.json
        
        rule_name = data.get('rule_name')
        evaluation_data = data.get('data')
        db = get_db()
        
        db_rule = database.get_rule_by_name(db, rule_name)
       
        if db_rule is None:
            abort(404, description="Rule not found")
        
        ast = json_to_ast(db_rule.ast_json)
        
        
        result = ast.evaluate_rule(evaluation_data)
        
     
        return jsonify({"result": result}), 200
    except SQLAlchemyError as e:
        abort(500, description=f"Database error: {str(e)}")
    except Exception as e:
        abort(400, description=f"Error evaluating rule: {str(e)}")

# Helper functions to convert AST to JSON and vice versa
def root_to_json(root):
    if root is None:
        return ""
    return json.dumps(root, default=lambda o: o.__dict__)

def json_to_ast(json_str):
    data = json.loads(json_str)
    root = dict_to_node(data)
    return AST(root)

def dict_to_node(data):
    if data is None:
        return None
    node = Node(node_type=data['node_type'])
    node.left = dict_to_node(data.get('left'))
    node.right = dict_to_node(data.get('right'))
    
    if data['node_type'] == 'operand':
        node.value = Condition(
            lvariable=data['value']['lvariable'],
            rvalue=data['value']['rvalue'],
            comparison_type=data['value']['comparison_type']
        )
    else:
        
        operator = data['value']['type']
        print(operator, "operator")
        if operator == 'AND':
            node.value = ANDOperator('AND')
        elif operator == 'OR':
            node.value = OROperator('OR')
    
    return node




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)