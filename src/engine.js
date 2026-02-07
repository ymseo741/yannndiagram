
/**
 * PPT Diagram Engine - Pro Pro Layout
 */

const CONFIG = {
    canvasWidth: 1920,
    canvasHeight: 1080,
    nodeWidth: 280,
    baseNodeHeight: 120,
    horizontalGap: 60,
    verticalGap: 100,
    marginTop: 100,
    marginLeft: 100,
};

/**
 * Calculates node dimensions based on text line count with padding
 */
function getNodeDimensions(node) {
    const lineCount = (node.text || "").split("\\n").length;
    // Dynamic height: 40px padding + 32px per line
    const height = Math.max(CONFIG.baseNodeHeight, 40 + lineCount * 32);
    return { width: CONFIG.nodeWidth, height };
}

/**
 * RECURSIVE SUBTREE CALCULATION (Smart Layout)
 * Calculates the total width/height of a node's subtree to prevent collisions.
 */
function calculateSubtreeSizes(node, isVertical, config = {}) {
    const { width: w, height: h } = getNodeDimensions(node);
    node.w = w;
    node.h = h;

    if (!node.children || node.children.length === 0) {
        node.subtreeSize = isVertical ? w : h;
        return node.subtreeSize;
    }

    const defaultGap = isVertical ? CONFIG.horizontalGap : CONFIG.verticalGap;
    const gap = config.siblingSpacing !== undefined ? config.siblingSpacing : defaultGap;

    // Recursively calculate children sizes
    const childrenTotalSize = node.children.reduce((acc, child, index) => {
        const childSize = calculateSubtreeSizes(child, isVertical, config);
        // Add gap only between children
        return acc + childSize + (index < node.children.length - 1 ? gap : 0);
    }, 0);

    // Subtree size is max of node's own size OR its children's total width
    node.subtreeSize = Math.max(isVertical ? w : h, childrenTotalSize);
    return node.subtreeSize;
}

/**
 * RECURSIVE COORDINATE ASSIGNMENT
 * Centers parent over its subtree.
 */
function assignCoordinates(node, offset, depth, isVertical, config = {}) {
    // Dynamic level step based on orientation or config
    const defaultLevelStep = isVertical ? 300 : 400;
    const levelStep = config.levelStep || defaultLevelStep;

    const { subtreeSize, w, h } = node;

    // 1. Position current node
    if (isVertical) {
        node.y = CONFIG.marginTop + depth * levelStep;
        // Center node within its allocated subtree width
        node.x = offset + (subtreeSize / 2) - (w / 2);
    } else {
        node.x = CONFIG.marginLeft + depth * levelStep;
        node.y = offset + (subtreeSize / 2) - (h / 2);
    }

    // Add manual offsets if present
    node.x += (node.offsetX || 0);
    node.y += (node.offsetY || 0);

    // 2. Position children
    if (node.children && node.children.length > 0) {
        const defaultGap = isVertical ? CONFIG.horizontalGap : CONFIG.verticalGap;
        const gap = config.siblingSpacing !== undefined ? config.siblingSpacing : defaultGap;

        // Calculate starting offset for children to center them under this node
        // Actually, 'offset' passed in is the start of THIS node's allocated space.
        // We just need to stack children sequentially within this space.
        // BUT, we need to center the block of children relative to the node if node > children?
        // Logic: The subtreeSize ALREADY accounts for max(node, children).
        // If subtreeSize == childrenTotal, we start at 'offset'.
        // If subtreeSize == nodeSize (and node > children), we need to center children.

        const childrenTotalSize = node.children.reduce((acc, c, i) => acc + c.subtreeSize + (i < node.children.length - 1 ? gap : 0), 0);

        let currentChildOffset = offset + (subtreeSize - childrenTotalSize) / 2;

        node.children.forEach(child => {
            assignCoordinates(child, currentChildOffset, depth + 1, isVertical, config);
            currentChildOffset += child.subtreeSize + gap;
        });
    }
}

function generateConnectors(node, isVertical, connectors = [], config = {}) {
    const style = config.connectorStyle || 'orthogonal'; // 'orthogonal', 'curved', 'straight'

    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            const levelGap = child.y - (node.y + node.h); // Dynamic vertical gap
            const horzLevelGap = child.x - (node.x + node.w);

            let path = "";
            let startX, startY, endX, endY;

            if (isVertical) {
                startX = node.x + node.w / 2;
                startY = node.y + node.h;
                endX = child.x + child.w / 2;
                endY = child.y;
            } else {
                startX = node.x + node.w;
                startY = node.y + node.h / 2;
                endX = child.x;
                endY = child.y + child.h / 2;
            }

            if (style === 'straight') {
                path = `M ${startX} ${startY} L ${endX} ${endY}`;
            } else if (style === 'curved') {
                if (isVertical) {
                    const midY = startY + (endY - startY) / 2;
                    path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                } else {
                    const midX = startX + (endX - startX) / 2;
                    path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                }
            } else {
                // Orthogonal (Default)
                if (isVertical) {
                    const midY = startY + (levelGap / 2);
                    path = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
                } else {
                    const midX = startX + (horzLevelGap / 2);
                    path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
                }
            }

            connectors.push({ path, from: node.id, to: child.id });
            generateConnectors(child, isVertical, connectors, config);
        });
    }
    return connectors;
}

/**
 * Flattens tree into array with paths preserved
 */
function flattenNodes(node, path = [], nodes = []) {
    const { children, subtreeSize, ...rest } = node;
    const currentPath = [...path, node.id];
    nodes.push({ ...rest, path: currentPath });
    if (children) {
        children.forEach(child => flattenNodes(child, currentPath, nodes));
    }
    return nodes;
}

export function layoutHierarchy(inputData, orientation = 'vertical', config = {}) {
    const isVertical = orientation === 'vertical';
    const roots = Array.isArray(inputData) ? inputData : [inputData];

    let allNodes = [];
    let allConnectors = [];
    let groups = [];

    const defaultGap = isVertical ? CONFIG.horizontalGap : CONFIG.verticalGap;
    const gap = config.siblingSpacing !== undefined ? config.siblingSpacing : defaultGap;

    roots.forEach(root => calculateSubtreeSizes(root, isVertical, config));
    const totalSubtreeSize = roots.reduce((acc, root) => acc + root.subtreeSize, 0) + (roots.length - 1) * gap;

    let currentOffset = (isVertical ? CONFIG.canvasWidth : CONFIG.canvasHeight) / 2 - totalSubtreeSize / 2;

    roots.forEach(root => {
        assignCoordinates(root, currentOffset, 0, isVertical, config);
        const flattened = flattenNodes(root);
        allNodes = allNodes.concat(flattened);
        allConnectors = allConnectors.concat(generateConnectors(root, isVertical, [], config));
        currentOffset += root.subtreeSize + gap;
    });

    // Flexible Grouping Logic (Matching labels)
    const groupsMap = {};
    allNodes.forEach(n => {
        if (n.groupLabel && n.groupLabel.trim() !== "") {
            const label = n.groupLabel.trim();
            if (!groupsMap[label]) groupsMap[label] = { nodes: new Set(), color: n.groupColor || "#CBD5E1" };

            // Add this node and ALL its descendants (nodes whose path contains n.id)
            allNodes.forEach(cand => {
                if (cand.path && Array.isArray(cand.path) && cand.path.includes(n.id)) {
                    groupsMap[label].nodes.add(cand);
                }
            });
        }
    });

    Object.keys(groupsMap).forEach(label => {
        const nodesInGroup = Array.from(groupsMap[label].nodes);
        if (nodesInGroup.length === 0) return;

        const minX = Math.min(...nodesInGroup.map(sn => sn.x)) - 25;
        const minY = Math.min(...nodesInGroup.map(sn => sn.y)) - 25;
        const maxX = Math.max(...nodesInGroup.map(sn => sn.x + sn.w)) + 25;
        const maxY = Math.max(...nodesInGroup.map(sn => sn.y + sn.h)) + 25;

        groups.push({
            id: `group-${label}`,
            x: minX,
            y: minY,
            w: maxX - minX,
            h: maxY - minY,
            label,
            color: groupsMap[label].color
        });
    });

    return { nodes: allNodes, connectors: allConnectors, groups };
}
