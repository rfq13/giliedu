from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class AgeLevel(str, Enum):
    SD = "sd"
    SMP = "smp"
    SMA = "sma"
    KULIAH = "kuliah"

class StoryInput(BaseModel):
    story_id: str
    user_id: str
    content: str
    input_type: str  # "audio" or "text"
    age_level: AgeLevel = AgeLevel.SD
    prompt_title: Optional[str] = None

class StoryEvaluation(BaseModel):
    clarity_score: int = Field(ge=0, le=100, description="Skor kejelasan bertutur")
    structure_score: int = Field(ge=0, le=100, description="Skor alur cerita")
    creativity_score: int = Field(ge=0, le=100, description="Skor kreativitas")
    expression_score: int = Field(ge=0, le=100, description="Skor ekspresi perasaan")
    overall_score: int = Field(ge=0, le=100, description="Skor keseluruhan")
    feedback_text: str = Field(description="Feedback naratif yang positif dan membangun")
    strengths: List[str] = Field(description="Kelebihan cerita")
    improvements: List[str] = Field(description="Saran perbaikan yang konstruktif")

class EvaluationState(BaseModel):
    story: StoryInput
    is_valid: bool = False
    validation_errors: List[str] = []
    evaluation: Optional[StoryEvaluation] = None
    error: Optional[str] = None
