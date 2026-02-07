import PptxGenJS from "pptxgenjs";
import { saveAs } from 'file-saver';

/**
 * Exports the current diagram layout to a PPTX file.
 * @param {Object} layout - The calculated layout containing nodes, connectors, and groups.
 * @param {Object} theme - The current visual theme.
 * @param {boolean} isPortrait - Canvas orientation.
 * @param {Object} data - Original node data (for notes/metadata).
 */
export const exportToPptx = (layout, theme, isPortrait, data) => {
    const pptx = new PptxGenJS();

    // Set Layout (16:9 or custom based on isPortrait)
    // PptxGenJS uses inches by default or 'LAYOUT_16x9'
    // To match our 1920x1080 (16:9) or 1080x1920 (9:16), we can use custom
    if (isPortrait) {
        pptx.defineLayout({ name: 'PORTRAIT_9_16', width: 7.5, height: 13.33 });
        pptx.layout = 'PORTRAIT_9_16';
    } else {
        pptx.layout = 'LAYOUT_16x9';
    }

    const slide = pptx.addSlide();

    // 1. Background
    slide.background = { color: theme.canvasBg === '#ffffff' ? 'FFFFFF' : theme.canvasBg.replace('#', '') };

    // Scaling Factor
    // Web: 1920px width -> PPT: 10 inches or 13.33 inches?
    // 16x9 layout in PptxGenJS is 10 x 5.625 inches usually. 
    // Let's use a scale factor mapping ~1920px to ~10 inches => 1px = 0.0052 inches
    const scale = 10 / 1920;

    // 2. Connectors
    layout.connectors.forEach(conn => {
        // Simple line mapping for now. Complex paths (curves) are harder in PptxGenJS without detailed points.
        // We will try to parse the SVG path commands if possible, OR just draw simple lines for MVP.
        // Parse "M x y L x y..."
        const points = parseSvgPath(conn.path);
        if (points.length > 1) {
            // Draw segments
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];

                slide.addShape(pptx.ShapeType.line, {
                    x: p1.x * scale,
                    y: p1.y * scale,
                    w: (p2.x - p1.x) * scale,
                    h: (p2.y - p1.y) * scale,
                    line: {
                        color: (theme.line || "94A3B8").replace('#', ''),
                        width: 2,
                        dashType: theme.dashed ? 'dash' : 'solid'
                    }
                });
            }
        }
    });

    // 3. Groups (Background Rects)
    (layout.groups || []).forEach(g => {
        slide.addShape(pptx.ShapeType.rect, {
            x: g.x * scale,
            y: g.y * scale,
            w: g.w * scale,
            h: g.h * scale,
            fill: { color: g.color.replace('#', ''), transparency: 94 }, // 6% opacity
            line: { color: g.color.replace('#', ''), width: 1, dashType: 'dash' }
        });
        // Group Label
        slide.addText(g.label, {
            x: (g.x + 15) * scale,
            y: (g.y - 12) * scale,
            fontSize: 10,
            bold: true,
            color: g.color.replace('#', '')
        });
    });

    // 4. Nodes
    (layout.nodes || []).forEach(node => {
        const isRoot = data.some(d => d.id === node.id); // Re-check if root based on data

        // Check for manual color override vs theme
        const isDefaultBg = node.color === "#F8FAFC" || node.color === "#ffffff";
        const fillColor = (isDefaultBg ? (theme.nodeBg || node.color) : node.color).replace('#', '');

        slide.addShape(pptx.ShapeType.rect, {
            x: node.x * scale,
            y: node.y * scale,
            w: node.w * scale,
            h: node.h * scale,
            fill: { color: fillColor, transparency: (theme.id === 'blueprint' && !isRoot) ? 100 : 0 },
            line: {
                color: (isRoot ? (theme.highlight || "1D4ED8") : (theme.nodeBorder || "CBD5E1")).replace('#', ''),
                width: isRoot ? 2 : 1
            },
            rectRadius: 0.1 // Rounded corners approximation
        });

        // Text
        const textColor = (isRoot ? '#FFFFFF' : (theme.text || "1E293B")).replace('#', '');
        slide.addText(node.text.replace(/\\n/g, "\n"), {
            x: node.x * scale,
            y: node.y * scale,
            w: node.w * scale,
            h: node.h * scale,
            fontSize: (node.fontSize || 20) * 0.75, // Scale font down slightly for PPT
            color: textColor,
            bold: isRoot || node.fontWeight === 'bold',
            align: 'center',
            valign: 'middle',
            fontFace: theme.font === 'monospace' ? 'Courier New' : 'Arial'
        });
    });

    const fileName = `Diagram_${new Date().toISOString().slice(0, 10)}.pptx`;

    // Use write('blob') + file-saver's saveAs to ensure filename is respected on all browsers (especially Safari)
    pptx.write('blob').then((blob) => {
        const file = new File([blob], fileName, { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
        saveAs(file);
    }).catch(err => {
        console.error("PPTX Generation Error:", err);
    });
};

// Helper: extremely basic SVG path parser for M and L commands
function parseSvgPath(d) {
    // E.g., "M 100 200 L 100 300 L 400 300"
    const commands = d.split(/(?=[MLC])/);
    const points = [];

    commands.forEach(cmd => {
        const parts = cmd.trim().split(/\s+/);
        const type = parts[0];

        if (type === 'M' || type === 'L') {
            points.push({ x: parseFloat(parts[1]), y: parseFloat(parts[2]) });
        } else if (type === 'C') {
            // Curve: has 3 points (c1, c2, end). We just take the end point for linear approximation for now
            // PptxGenJS shapes are simple. 
            // "C 100 250, 200 250, 200 400" -> parts: [C, x1, y1,, x2, y2,, x3, y3]
            // Removing commas
            const coords = cmd.replace(/[MC,]/g, ' ').trim().split(/\s+/);
            // Last 2 are endpoint
            points.push({ x: parseFloat(coords[coords.length - 2]), y: parseFloat(coords[coords.length - 1]) });
        }
    });
    return points;
}
