import axios from "axios";

const API_URL = "http://127.0.0.1:4000";

export const createRule = async (rule: string, name: string) => {
  console.log(`${API_URL}/create_rule`, { rule, name });
  const response = await axios.post(`${API_URL}/create_rule`, { rule, name });
  console.log(response);
  return response.data;
};

export const combineRules = async (rules: string[]) => {
  console.log(`${API_URL}/combine_rules`, { rules });
  const response = await axios.post(`${API_URL}/combine_rules`, { rules });

  return response.data;
};

export const evaluateRule = async (
  ruleName: string,
  data: Record<string, any>
) => {
  const response = await axios.post(`${API_URL}/evaluate_rule`, {
    rule_name: ruleName,
    data,
  });
  return response.data;
};

export const checkRuleExistence = async (ruleName: string) => {
  const response = await axios.post(`${API_URL}/check_rule`, {
    rule_name: ruleName,
  });
  return response.data;
};
