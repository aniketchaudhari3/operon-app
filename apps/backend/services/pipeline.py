from collections import defaultdict, deque

INPUT_TYPE = "customInput"
OUTPUT_TYPE = "customOutput"
NOTE_TYPE = "note"

def get_node_type(node: dict[str, object]) -> str:
    data = node.get("data")
    if isinstance(data, dict):
        node_type = data.get("nodeType")
        if isinstance(node_type, str):
            return node_type
    node_type = node.get("type")
    return node_type if isinstance(node_type, str) else ""


def _check(title: str, detail_pass: str, detail_fail: str, passed: bool) -> dict[str, object]:
    return {
        "title": title,
        "detail": detail_pass if passed else detail_fail,
        "passed": passed,
    }


def validate_pipeline(
    nodes: list[dict[str, object]], edges: list[dict[str, object]]
) -> tuple[bool, list[dict[str, object]]]:
    checks: list[dict[str, object]] = []

    pipeline_nodes = [node for node in nodes if get_node_type(node) != NOTE_TYPE]
    node_ids = {str(node["id"]) for node in pipeline_nodes if "id" in node}
    node_types = {
        str(node["id"]): get_node_type(node)
        for node in pipeline_nodes
        if "id" in node
    }

    has_nodes = len(pipeline_nodes) > 0
    checks.append(
        _check(
            "Non-empty workflow",
            "Workflow contains at least one node.",
            "Add at least one node to the workflow.",
            has_nodes,
        )
    )
    if not has_nodes:
        return False, checks

    valid_edges: list[tuple[str, str]] = []
    broken_edge_count = 0
    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        if not isinstance(source, str) or not isinstance(target, str):
            continue
        if source not in node_ids or target not in node_ids:
            broken_edge_count += 1
            continue
        valid_edges.append((source, target))

    checks.append(
        _check(
            "Valid connections",
            "All connections reference existing nodes.",
            f"{broken_edge_count} connection(s) reference missing nodes.",
            broken_edge_count == 0,
        )
    )

    has_connections = len(valid_edges) > 0
    checks.append(
        _check(
            "Connected workflow",
            "Nodes are linked together.",
            "Nodes exist but none are connected.",
            has_connections,
        )
    )
    if not has_connections:
        return False, checks

    connected_ids: set[str] = set()
    for source, target in valid_edges:
        connected_ids.add(source)
        connected_ids.add(target)

    orphan_ids = sorted(node_ids - connected_ids)
    checks.append(
        _check(
            "No orphan nodes",
            "Every node is part of the workflow.",
            f"{len(orphan_ids)} node(s) are not connected to the workflow.",
            len(orphan_ids) == 0,
        )
    )

    adjacency: dict[str, list[str]] = defaultdict(list)
    reverse_adjacency: dict[str, list[str]] = defaultdict(list)
    out_degree: dict[str, int] = {node_id: 0 for node_id in node_ids}
    in_degree: dict[str, int] = {node_id: 0 for node_id in node_ids}

    for source, target in valid_edges:
        adjacency[source].append(target)
        reverse_adjacency[target].append(source)
        out_degree[source] += 1
        in_degree[target] += 1

    is_connected = True
    if len(connected_ids) > 1:
        visited: set[str] = set()
        start = next(iter(connected_ids))
        queue = deque([start])
        visited.add(start)
        while queue:
            current = queue.popleft()
            for neighbor in adjacency[current] + reverse_adjacency[current]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        is_connected = len(visited) == len(connected_ids)

    checks.append(
        _check(
            "Single workflow graph",
            "All nodes belong to one connected workflow.",
            "All nodes must belong to a single connected workflow.",
            is_connected,
        )
    )

    input_ids = [node_id for node_id, kind in node_types.items() if kind == INPUT_TYPE]
    output_ids = [
        node_id for node_id, kind in node_types.items() if kind == OUTPUT_TYPE
    ]

    checks.append(
        _check(
            "Input node present",
            "Pipeline has an entry point.",
            "Add an Input node as the pipeline entry point.",
            len(input_ids) > 0,
        )
    )

    checks.append(
        _check(
            "Output node present",
            "Pipeline has a result node.",
            "Add an Output node as the pipeline result.",
            len(output_ids) > 0,
        )
    )

    has_input_output_path = False
    if input_ids and output_ids:
        reachable: set[str] = set()
        queue = deque(input_ids)
        for input_id in input_ids:
            reachable.add(input_id)
        while queue:
            current = queue.popleft()
            for neighbor in adjacency[current]:
                if neighbor not in reachable:
                    reachable.add(neighbor)
                    queue.append(neighbor)
        has_input_output_path = any(output_id in reachable for output_id in output_ids)

    checks.append(
        _check(
            "Input-to-output path",
            "Output is reachable from Input.",
            "Connect Input to Output through the workflow.",
            has_input_output_path,
        )
    )

    invalid_input = any(
        kind == INPUT_TYPE and in_degree[node_id] > 0
        for node_id, kind in node_types.items()
    )
    checks.append(
        _check(
            "Input node wiring",
            "Input nodes only have outgoing connections.",
            "Input nodes cannot have incoming connections.",
            not invalid_input,
        )
    )

    invalid_output = any(
        kind == OUTPUT_TYPE and out_degree[node_id] > 0
        for node_id, kind in node_types.items()
    )
    checks.append(
        _check(
            "Output node wiring",
            "Output nodes only have incoming connections.",
            "Output nodes cannot have outgoing connections.",
            not invalid_output,
        )
    )

    dead_end_ids = [
        node_id
        for node_id, kind in node_types.items()
        if kind not in {INPUT_TYPE, OUTPUT_TYPE, NOTE_TYPE}
        and node_id in connected_ids
        and out_degree[node_id] == 0
    ]
    checks.append(
        _check(
            "No dead-end nodes",
            "All processing nodes feed into downstream steps.",
            f"{len(dead_end_ids)} processing node(s) have no downstream connection.",
            len(dead_end_ids) == 0,
        )
    )

    return all(bool(check["passed"]) for check in checks), checks
