"use client";
import { useState, useEffect } from "react";
import { createRule, combineRules, evaluateRule } from "@/app/services/api";
import ASTTree from "@/app/components/ASTTree";
import { checkRuleExistence } from "@/app/services/api";

const Home = () => {
  const [rule, setRule] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [searchRuleName, setSearchRuleName] = useState("");
  const [combinedRules, setCombinedRules] = useState<string[]>([]);
  const [ast, setAst] = useState<any>(null);

  const [isRuleFound, setIsRuleFound] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);

  const [formData, setFormData] = useState<string[]>([]); // Store API data
  const [inputValues, setInputValues] = useState<{ [key: string]: number }>({});
  const [satisfy, setSatisfy] = useState<boolean | null>(null); // Store user inputs

  // Simulate getting data from the API
  useEffect(() => {
    // This data would come from the API
    const apiData = ["a", "b", "c"]; // Replace with the actual API data
  }, []);

  // Handle input change
  const handleInputChange = (label: string, value: number) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [label]: value,
    }));
  };

  // Handle form submission

  const handleCreateRule = async () => {
    const data = await createRule(rule, ruleName);
    const parsedNode = typeof data === "string" ? JSON.parse(data) : data;
    setAst(parsedNode);
  };

  const handleCombineRules = async () => {
    const data = await combineRules(combinedRules);
    if (data) {
      const parsedNode = typeof data === "string" ? JSON.parse(data) : data;
      setAst(parsedNode);
    } else {
      setAst(data);
    }
  };

  const handleEvaluateRule = async () => {
    const data = inputValues;
    console.log(data);
    const evaluationResult = await evaluateRule(searchRuleName, data);
    console.log(evaluationResult);
    setSatisfy(evaluationResult.result);
  };

  const handleCheckRuleExistence = async () => {
    // Mocked API call to check if the rule exists in the database
    setFormData([]);
    setInputValues({});
    console.log(searchRuleName);
    const response = await checkRuleExistence(searchRuleName);
    const exists = response.length > 0;
    setIsRuleFound(exists);
    if (exists) {
      // Placeholder: Replace with the actual API call to fetch dynamic fields when the rule is found.
      setFormData(response);
    } else {
      setFormData([]);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Rule Engine</h1>

      <div style={styles.section}>
        <h2 style={styles.subHeader}>Create Rule</h2>
        <input
          type='text'
          placeholder='Rule Name'
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
          style={styles.input}
        />
        <input
          type='text'
          placeholder='Rule'
          value={rule}
          onChange={(e) => setRule(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCreateRule} style={styles.button}>
          Create Rule
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.subHeader}>Combine Rules</h2>
        {combinedRules.map((rule, index) => (
          <input
            key={index}
            type='text'
            value={rule}
            onChange={(e) => {
              const newRules = [...combinedRules];
              newRules[index] = e.target.value;
              setCombinedRules(newRules);
            }}
            style={styles.input}
          />
        ))}
        <button
          onClick={() => setCombinedRules([...combinedRules, ""])}
          style={styles.button}
        >
          Add Rule
        </button>
        <button onClick={handleCombineRules} style={styles.button}>
          Combine Rules
        </button>
      </div>

      <div style={styles.astContainer}>{ast && <ASTTree root={ast} />}</div>

      <div style={styles.section}>
        <h2 style={styles.subHeader}>Execute Rules</h2>
        <input
          type='text'
          placeholder='Search Rule Name'
          value={searchRuleName}
          onChange={(e) => setSearchRuleName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCheckRuleExistence} style={styles.button}>
          Search Rule
        </button>

        {!isRuleFound && (
          <h2 style={styles.subHeader}>
            No rule found in database with the given name
          </h2>
        )}
        {isRuleFound && (
          <div>
            <form>
              {formData.map((label, index) => (
                <div key={index} style={styles.formGroup}>
                  <label style={styles.label}>{label}</label>
                  <input
                    type='text'
                    placeholder={`Enter value for ${label}`}
                    value={inputValues[label] || ""}
                    onChange={(e) =>
                      handleInputChange(label, parseInt(e.target.value))
                    }
                    style={styles.input}
                  />
                </div>
              ))}
              <button
                type='button'
                onClick={handleEvaluateRule}
                style={styles.button}
              >
                Evaluate Rule
              </button>
            </form>
          </div>
        )}
        {satisfy != null && (
          <div style={styles.section}>
            <h2 style={styles.subHeader}>
              These values {satisfy ? "satisfy" : "not satisy"} the rule
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  formGroup: {
    marginBottom: "10px",
  },
  label: {
    marginRight: "10px",
    fontWeight: "bold",
  },
  dynamicContainer: {
    marginTop: "20px",
  },
  dynamicField: {
    marginBottom: "10px",
  },
  container: {
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    color: "#5e35b1",
    textAlign: "center",
    fontSize: "36px",
  },
  subHeader: {
    color: "#7e57c2",
    fontSize: "24px",
    marginBottom: "10px",
  },
  section: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #d1c4e9",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "10px 15px",
    marginRight: "10px",
    backgroundColor: "#7e57c2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  buttonHover: {
    backgroundColor: "#5e35b1",
  },
  astContainer: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
};

export default Home;
