from abc import ABC, abstractmethod

class AIService(ABC):
    @abstractmethod
    def perform_analysis(self, forum_post_text: str, original_source_text: str) -> str:
        pass
