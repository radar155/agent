---
inclusion: always
---

# LangChain Documentation Rule

Before writing or modifying ANY code that involves LangChain (imports, classes, functions, or concepts from the langchain ecosystem), you MUST:

1. Use the Context7 MCP tools to fetch the latest LangChain documentation
2. Call `resolve-library-id` with "langchain" to get the correct library ID
3. Call `get-library-docs` with the resolved ID and relevant topic to retrieve up-to-date API references and examples

This ensures all LangChain implementations follow current best practices and use the correct, non-deprecated APIs.

Do NOT rely on training data for LangChain code - always verify with live documentation first.
