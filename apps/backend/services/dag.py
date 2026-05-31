from collections import defaultdict, deque


def is_dag(nodes: list[dict[str, object]], edges: list[dict[str, object]]) -> bool:
    node_ids = {str(node["id"]) for node in nodes if "id" in node}
    adjacency: dict[str, list[str]] = defaultdict(list)
    in_degree: dict[str, int] = {node_id: 0 for node_id in node_ids}

    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        if not isinstance(source, str) or not isinstance(target, str):
            continue
        if source not in node_ids or target not in node_ids:
            continue
        adjacency[source].append(target)
        in_degree[target] += 1

    queue = deque(node_id for node_id, degree in in_degree.items() if degree == 0)
    visited = 0

    while queue:
        current = queue.popleft()
        visited += 1
        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return visited == len(node_ids)
