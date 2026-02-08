
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
 * INTELLIGENT POSITIONING (LINEAR)
 */
function assignCoordinates(node, offset, depth, isVertical, config, levelOffsets) {
    const { subtreeSize, w, h } = node;
    const currentLevelStep = levelOffsets[depth] || 0;

    if (isVertical) {
        node.y = CONFIG.marginTop + currentLevelStep;
        node.x = offset + (subtreeSize / 2) - (w / 2);
    } else {
        node.x = CONFIG.marginLeft + currentLevelStep;
        node.y = offset + (subtreeSize / 2) - (h / 2);
    }

    node.x += (node.offsetX || 0);
    node.y += (node.offsetY || 0);

    if (node.children && node.children.length > 0) {
        const defaultGap = isVertical ? CONFIG.horizontalGap : CONFIG.verticalGap;
        const gap = config.siblingSpacing !== undefined ? config.siblingSpacing : defaultGap;
        const childrenTotalSize = node.children.reduce((acc, c, i) => acc + c.subtreeSize + (i < node.children.length - 1 ? gap : 0), 0);
        let currentChildOffset = offset + (subtreeSize - childrenTotalSize) / 2;

        node.children.forEach(child => {
            assignCoordinates(child, currentChildOffset, depth + 1, isVertical, config, levelOffsets);
            currentChildOffset += child.subtreeSize + gap;
        });
    }
}

/**
 * INTELLIGENT CIRCULAR/ELLIPTICAL POSITIONING
 */
function assignCircularCoordinates(node, centerX, centerY, radiusX, radiusY, startAngle, sweepAngle, depth, config, levelRadii) {
    const { width: w, height: h } = getNodeDimensions(node);
    node.w = w; node.h = h;

    const currentRadiusX = (levelRadii[depth] || radiusX);
    const currentRadiusY = (levelRadii[depth] || radiusY) * (1 - (config.ellipseRatio || 0));

    const midAngle = startAngle + sweepAngle / 2;
    node.x = centerX + currentRadiusX * Math.cos(midAngle) - w / 2;
    node.y = centerY + currentRadiusY * Math.sin(midAngle) - h / 2;

    node.x += (node.offsetX || 0);
    node.y += (node.offsetY || 0);

    if (node.children && node.children.length > 0) {
        const totalSize = node.children.reduce((acc, child) => acc + child.subtreeSize, 0);
        let currentAngle = startAngle;
        node.children.forEach((child) => {
            const childSweep = (child.subtreeSize / totalSize) * sweepAngle;
            assignCircularCoordinates(child, centerX, centerY, currentRadiusX, currentRadiusY, currentAngle, childSweep, depth + 1, config, levelRadii);
            currentAngle += childSweep;
        });
    }
}

function generateConnectors(node, isVertical, connectors = [], config = {}) {
    const style = config.connectorStyle || 'orthogonal';

    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            const levelGap = child.y - (node.y + node.h);
            const horzLevelGap = child.x - (node.x + node.w);

            let path = "";
            let startX, startY, endX, endY;

            if (config.isCircular) {
                startX = node.x + node.w / 2;
                startY = node.y + node.h / 2;
                endX = child.x + child.w / 2;
                endY = child.y + child.h / 2;
            } else if (isVertical) {
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

            if (style === 'straight' || (config.isCircular && style !== 'curved')) {
                path = `M ${startX} ${startY} L ${endX} ${endY}`;
            } else if (style === 'curved') {
                if (config.isCircular) {
                    // Quadratic curve for radial lines
                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;
                    const angle = Math.atan2(endY - startY, endX - startX);
                    const ctrlDist = 80;
                    const cpX = midX + ctrlDist * Math.cos(angle + Math.PI / 2);
                    const cpY = midY + ctrlDist * Math.sin(angle + Math.PI / 2);
                    path = `M ${startX} ${startY} Q ${cpX} ${cpY}, ${endX} ${endY}`;
                } else if (isVertical) {
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
    if (!node) return nodes;
    const currentPath = [...path, node.id];
    node.path = currentPath;
    nodes.push(node);
    if (node.children) {
        node.children.forEach(child => flattenNodes(child, currentPath, nodes));
    }
    return nodes;
}

export function layoutHierarchy(inputData, orientation = 'vertical', config = {}) {
    const isVertical = orientation === 'vertical';
    const isCircular = orientation === 'circular' || orientation === 'cycle' || orientation === 'elliptical';
    const isCycle = orientation === 'cycle';
    const roots = Array.isArray(inputData) ? inputData : [inputData];
    const extendedConfig = { ...config, isCircular };

    let allNodes = [];
    let allConnectors = [];
    let groups = [];

    // Always calculate subtree sizes for initial metrics
    roots.forEach(r => calculateSubtreeSizes(r, isVertical, config));

    if (isCircular || orientation === 'elliptical') {
        const centerX = CONFIG.canvasWidth / 2;
        const centerY = CONFIG.canvasHeight / 2;
        const startAngle = config.startAngle !== undefined ? config.startAngle : -Math.PI / 2;

        // Flatten all nodes to place them on a SINGLE perimeter
        const nodesToPlace = roots.flatMap(root => flattenNodes(root)).filter(n => n.id);
        const totalNodes = nodesToPlace.length;

        // Default radii
        let rX = orientation === 'elliptical' ? 650 : 450;
        let rY = orientation === 'elliptical' ? 350 : 450;

        if (totalNodes > 0) {
            // Calculate required circumference to avoid overlap
            // Node width (280) + gap (60)
            const minSpacing = CONFIG.nodeWidth + 60;
            const requiredCircumference = totalNodes * minSpacing;
            const minRadius = requiredCircumference / (2 * Math.PI);

            // Base radius for circular mode, scaled for elliptical
            const isEllipticalPreset = orientation === 'elliptical';
            rX = Math.max(isEllipticalPreset ? 650 : 450, minRadius);
            rY = Math.max(isEllipticalPreset ? 350 : 450, minRadius * (isEllipticalPreset ? 0.6 : 1));

            const sweepStep = (2 * Math.PI) / totalNodes;

            nodesToPlace.forEach((node, i) => {
                const angle = startAngle + i * sweepStep;
                node.x = centerX + rX * Math.cos(angle) - node.w / 2;
                node.y = centerY + rY * Math.sin(angle) - node.h / 2;
                node.x += (node.offsetX || 0);
                node.y += (node.offsetY || 0);
            });
        }

        allNodes = nodesToPlace;

        if (isCycle) {
            // Sequential connectors for CYCLE
            for (let i = 0; i < allNodes.length; i++) {
                const from = allNodes[i];
                const to = allNodes[(i + 1) % allNodes.length];
                const startX = from.x + from.w / 2; const startY = from.y + from.h / 2;
                const endX = to.x + to.w / 2; const endY = to.y + to.h / 2;

                let path = "";
                if (config.connectorStyle === 'curved') {
                    path = `M ${startX} ${startY} A ${rX} ${rY} 0 0 1 ${endX} ${endY}`;
                } else {
                    path = `M ${startX} ${startY} L ${endX} ${endY}`;
                }
                allConnectors.push({ path, from: from.id, to: to.id, isCycle: true });
            }
        } else {
            // Hierarchical connectors for CIRCULAR/ELLIPTICAL
            roots.forEach(root => {
                allConnectors = allConnectors.concat(generateConnectors(root, isVertical, [], extendedConfig));
            });
        }
    } else {
        const gap = config.siblingSpacing !== undefined ? config.siblingSpacing : (isVertical ? CONFIG.horizontalGap : CONFIG.verticalGap);
        // Disciplined Grid calculation: use levelStep as baseline, expand only if collisions detected
        const levelOffsets = [0];
        const levelStepParam = config.levelStep || 300;

        const collectOffsets = (n, d) => {
            const nodeSize = isVertical ? n.h : n.w;
            // Next level preferred start: currentOffset + nodeSize + gap
            // We want it to be AT LEAST (d + 1) * levelStepParam, but more if needed.
            const preferredNext = levelOffsets[d] + nodeSize + 100; // 100 is internal gap
            const standardNext = (d + 1) * levelStepParam;

            levelOffsets[d + 1] = Math.max(levelOffsets[d + 1] || 0, preferredNext, standardNext);
            if (n.children) n.children.forEach(c => collectOffsets(c, d + 1));
        };
        roots.forEach(r => collectOffsets(r, 0));

        const totalSubtreeSize = roots.reduce((acc, root) => acc + root.subtreeSize, 0) + (roots.length - 1) * gap;
        let currentOffset = (isVertical ? CONFIG.canvasWidth : CONFIG.canvasHeight) / 2 - totalSubtreeSize / 2;

        roots.forEach(root => {
            assignCoordinates(root, currentOffset, 0, isVertical, config, levelOffsets);
            allNodes = allNodes.concat(flattenNodes(root));
            allConnectors = allConnectors.concat(generateConnectors(root, isVertical, [], extendedConfig));
            currentOffset += root.subtreeSize + gap;
        });
    }

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

    // Auto-Zoning Logic (Level-1 Subtrees)
    if (config.showZones) {
        // Collect all level-1 nodes (children of any root)
        const level1Nodes = [];
        roots.forEach(r => {
            if (r.children && r.children.length > 0) {
                level1Nodes.push(...r.children);
            }
        });

        const colorPalette = ["#E0F2FE", "#F0FDF4", "#FFF7ED", "#F3E8FF", "#FCE7F3", "#ECFEFF"];

        level1Nodes.forEach((l1, idx) => {
            // Find all descendants of this L1 node
            const descendants = allNodes.filter(n => n.path && n.path.includes(l1.id));
            const groupMembers = [l1, ...descendants];

            if (groupMembers.length === 0) return;

            const minX = Math.min(...groupMembers.map(n => n.x)) - 40;
            const minY = Math.min(...groupMembers.map(n => n.y)) - 40;
            const maxX = Math.max(...groupMembers.map(n => n.x + n.w)) + 40;
            const maxY = Math.max(...groupMembers.map(n => n.y + n.h)) + 40;

            // Generate soft pastel colors OR use override
            const defaultColor = colorPalette[idx % colorPalette.length];
            const defaultLabel = l1.text ? l1.text.split('\\n')[0] + " Zone" : "Zone";

            const override = config.zoneOverrides && config.zoneOverrides[l1.id];
            const finalColor = override?.color || defaultColor;
            const finalLabel = override?.label || defaultLabel;

            groups.push({
                id: `zone-${l1.id}`,
                x: minX,
                y: minY,
                w: maxX - minX,
                h: maxY - minY,
                label: finalLabel,
                color: finalColor,
                isZone: true,
                targetNodeId: l1.id // Store target node ID for mapping back in UI
            });
        });
    }

    return { nodes: allNodes, connectors: allConnectors, groups };
}
