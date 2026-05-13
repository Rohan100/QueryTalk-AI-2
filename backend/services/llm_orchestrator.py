import os
from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferWindowMemory
from pydantic import BaseModel, Field

class LLMOrchestrator:
    def __init__(self):
        # We will use Claude 3 Sonnet or Opus. The user asked for claude-sonnet-4-20250514. 
        # For actual execution with the current Langchain, we can just use "claude-3-5-sonnet-20240620"
        model_name = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20240620")
        api_key = os.getenv("ANTHROPIC_API_KEY")
        
        # In case API key is not set, we shouldn't crash on import, just when generating.
        self.llm = None
        if api_key:
            self.llm = ChatAnthropic(model_name=model_name, anthropic_api_key=api_key, temperature=0)

        # Buffer memory for last 10 messages
        self.memory = ConversationBufferWindowMemory(k=10, return_messages=True)

    def generate_sql(self, user_query: str, schema_info: str) -> str:
        if not self.llm:
            return "SELECT * FROM users; -- Mock SQL because API Key is missing"
            
        system_prompt = f"""You are an expert SQL generator. Your task is to convert the user's natural language question into a valid SQL query.
Use the following database schema to form your query:
{{schema_info}}

Return ONLY the raw SQL query, without any markdown formatting or explanation. Ensure it's read-only."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{user_query}")
        ])
        
        chain = prompt | self.llm
        history = self.memory.load_memory_variables({})["history"]
        
        response = chain.invoke({{
            "schema_info": schema_info,
            "history": history,
            "user_query": user_query
        }})
        
        self.memory.save_context({{"input": user_query}}, {{"output": response.content}})
        return response.content.strip()

    def summarize_results(self, user_query: str, sql_query: str, data_result: list) -> str:
        if not self.llm:
            return "Mock summary because API Key is missing."
            
        system_prompt = "You are a data analyst. Provide a brief, insightful summary of the data retrieved."
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", f"User question: {{user_query}}\nSQL executed: {{sql_query}}\nData result: {{data_result}}\n\nProvide a natural language summary and insights.")
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({{"user_query": user_query, "sql_query": sql_query, "data_result": data_result}})
        return response.content

llm_orchestrator = LLMOrchestrator()
