/**
 * Parses indented text into a hierarchical JSON structure for the diagram.
 * Supports tabs or 2-space indentation.
 * 
 * @param {string} text - The raw input text.
 * @returns {Array} - The parsed node data structure.
 */
export const parseIndentedText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const result = [];
    const stack = []; // Stores path of ancestors: [{ level, node }]

    lines.forEach((line) => {
        // Determine indentation level
        let level = 0;
        const leadingTabs = (line.match(/^\t+/) || [''])[0].length;
        if (leadingTabs > 0) {
            level = leadingTabs;
        } else {
            const leadingSpaces = (line.match(/^\s+/) || [''])[0].length;
            level = Math.floor(leadingSpaces / 2); // Assume 2 spaces per level
        }

        const cleanText = line.trim();
        const newNode = {
            id: `k-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: cleanText,
            color: "#F8FAFC", // Default (white/gray)
            textColor: "#1E293B", // Default Text
            fontSize: 18,
            children: []
        };

        // Root Level (Level 0)
        if (level === 0) {
            newNode.color = "#2563EB"; // Blue
            newNode.textColor = "#FFFFFF"; // White Text
            newNode.fontSize = 24;
            newNode.fontWeight = "bold";

            result.push(newNode);

            // Reset stack context to this new root
            stack.length = 0;
            stack.push({ level, node: newNode });
        } else {
            // Find parent
            // Pop stack until we find a node with level < current level
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length > 0) {
                const parent = stack[stack.length - 1].node;

                // Level 1 styling (Service Layer etc)
                if (level === 1) {
                    newNode.color = "#DBEAFE"; // Light Blue
                    newNode.textColor = "#1E293B";
                    newNode.fontSize = 20;
                    newNode.fontWeight = "500";
                }

                parent.children.push(newNode);
                stack.push({ level, node: newNode });
            } else {
                // If orphan (e.g. user pasted indented text without a root), treat as root
                newNode.color = "#2563EB";
                newNode.textColor = "#FFFFFF";
                newNode.fontSize = 24;
                newNode.fontWeight = "bold";
                result.push(newNode);
                stack.length = 0;
                stack.push({ level, node: newNode });
            }
        }
    });

    return result;
};
