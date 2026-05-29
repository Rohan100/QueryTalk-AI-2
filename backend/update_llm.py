import re

with open('services/llm_orchestrator.py', 'r') as f:
    content = f.read()

# Replace generate_sql signature and logic
content = re.sub(
    r'def generate_sql\(self, user_query: str, schema_info: str\) -> str:[\s\S]*?if not self\.llm:[\s\S]*?return "SELECT \* FROM users; -- Mock SQL because API Key is missing"',
    '''def generate_sql(self, user_query: str, schema_info: str, api_key: str = None) -> str:
        llm_to_use = self.llm
        if api_key:
            model_name = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20240620")
            llm_to_use = ChatAnthropic(model_name=model_name, anthropic_api_key=api_key, temperature=0)

        if not llm_to_use:
            return "SELECT * FROM users; -- Mock SQL because API Key is missing"''',
    content
)

# Replace self.llm with llm_to_use in generate_sql chain
content = content.replace('chain = prompt | self.llm', 'chain = prompt | llm_to_use', 1)

# Replace summarize_results signature and logic
content = re.sub(
    r'def summarize_results\(self, user_query: str, sql_query: str, data_result: list\) -> str:[\s\S]*?if not self\.llm:[\s\S]*?return "Mock summary because API Key is missing\."',
    '''def summarize_results(self, user_query: str, sql_query: str, data_result: list, api_key: str = None) -> str:
        llm_to_use = self.llm
        if api_key:
            model_name = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20240620")
            llm_to_use = ChatAnthropic(model_name=model_name, anthropic_api_key=api_key, temperature=0)

        if not llm_to_use:
            return "Mock summary because API Key is missing."''',
    content
)

# Replace self.llm with llm_to_use in summarize_results chain
content = content.replace('chain = prompt | self.llm', 'chain = prompt | llm_to_use', 1)

with open('services/llm_orchestrator.py', 'w') as f:
    f.write(content)
print("Updated llm_orchestrator.py")
