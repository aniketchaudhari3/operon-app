from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.dag import is_dag
from services.pipeline import validate_pipeline

router = APIRouter()


class PipelineNode(BaseModel):
    id: str
    type: str | None = None
    data: dict[str, object] | None = None


class PipelineEdge(BaseModel):
    source: str
    target: str


class ValidationCheck(BaseModel):
    title: str
    detail: str
    passed: bool


class ParseRequest(BaseModel):
    nodes: list[PipelineNode] = Field(default_factory=list)
    edges: list[PipelineEdge] = Field(default_factory=list)


class ParseResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    is_pipeline_valid: bool
    checks: list[ValidationCheck] = Field(default_factory=list)


@router.post("/pipelines/parse", response_model=ParseResponse)
def parse_pipeline(body: ParseRequest) -> ParseResponse:
    nodes = [node.model_dump() for node in body.nodes]
    edges = [edge.model_dump() for edge in body.edges]

    dag_valid = is_dag(nodes, edges)
    pipeline_valid, pipeline_checks = validate_pipeline(nodes, edges)

    dag_check = {
        "title": "Acyclic graph",
        "detail": (
            "No circular connections in the workflow."
            if dag_valid
            else "Remove circular connections to form a valid DAG."
        ),
        "passed": dag_valid,
    }

    return ParseResponse(
        num_nodes=len(nodes),
        num_edges=len(edges),
        is_dag=dag_valid,
        is_pipeline_valid=pipeline_valid,
        checks=[dag_check, *pipeline_checks],
    )
