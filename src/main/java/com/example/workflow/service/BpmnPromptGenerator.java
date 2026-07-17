package com.example.workflow.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Turns a natural-language process description into a valid BPMN 2.0 XML diagram.
 * Supports arrow lists, numbered sections, and [Gateway] Yes/No branches.
 */
public final class BpmnPromptGenerator {

    private static final Pattern SECTION_SPLIT =
            Pattern.compile("(?m)(?=^\\s*\\d+[.)]\\s*)");
    private static final Pattern SECTION_HEADER =
            Pattern.compile("^\\s*\\d+[.)]\\s*(?:\\[\\s*Gateway\\s*\\]\\s*)?(.+?)\\s*:?\\s*$",
                    Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);
    private static final Pattern ARROW_SPLIT =
            Pattern.compile("\\s*(?:→|->|=>)\\s*");
    private static final Pattern GATEWAY_MARK =
            Pattern.compile("(?i)\\[\\s*gateway\\s*\\]");

    private BpmnPromptGenerator() {}

    public static GeneratedBpmn generate(String prompt) {
        List<Node> nodes = parseNodes(prompt);
        if (nodes.isEmpty()) {
            nodes = Arrays.asList(
                    Node.task("Boshlash"),
                    Node.task("Ko'rib chiqish"),
                    Node.task("Yakunlash")
            );
        }
        if (nodes.size() > 20) {
            nodes = new ArrayList<>(nodes.subList(0, 20));
        }
        String xml = buildXml(nodes);
        return new GeneratedBpmn(suggestTitle(nodes), xml, nodeNames(nodes), hasGateway(nodes));
    }

    public static String slugify(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "process-" + System.currentTimeMillis();
        }
        String slug = text.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-)|(-$)", "");
        if (slug.isEmpty()) {
            slug = "process-" + System.currentTimeMillis();
        }
        return slug.length() > 60 ? slug.substring(0, 60) : slug;
    }

    // --- parsing ---

    static List<Node> parseNodes(String prompt) {
        String normalized = prompt.replace('\r', '\n').trim();

        if (hasNumberedSections(normalized)) {
            return parseNumberedSections(normalized);
        }

        if (ARROW_SPLIT.matcher(normalized).find() && !normalized.contains("\n")) {
            List<Node> nodes = new ArrayList<>();
            for (String part : ARROW_SPLIT.split(normalized)) {
                String c = shortLabel(part);
                if (!c.isEmpty()) nodes.add(Node.task(c));
            }
            if (wantsReject(normalized) && nodes.size() >= 2) {
                Node last = nodes.remove(nodes.size() - 1);
                nodes.add(Node.gateway(last.name));
            }
            return nodes;
        }

        List<Node> fromLines = new ArrayList<>();
        for (String line : normalized.split("\n")) {
            String t = line.trim();
            if (t.isEmpty()) continue;
            t = t.replaceFirst("^\\d+[.)]\\s*", "");
            t = t.replaceFirst("^[-*•]\\s*", "");
            if (isSkipLine(t)) continue;
            boolean gw = GATEWAY_MARK.matcher(t).find() || looksLikeDecision(t);
            String label = shortLabel(GATEWAY_MARK.matcher(t).replaceAll("").trim());
            if (label.isEmpty()) continue;
            fromLines.add(gw ? Node.gateway(label) : Node.task(label));
        }
        return fromLines;
    }

    private static boolean hasNumberedSections(String text) {
        int count = 0;
        Matcher m = Pattern.compile("(?m)^\\s*\\d+[.)]\\s+").matcher(text);
        while (m.find()) {
            if (++count >= 2) return true;
        }
        return false;
    }

    private static List<Node> parseNumberedSections(String text) {
        String[] parts = SECTION_SPLIT.split(text);
        List<Node> nodes = new ArrayList<>();
        for (String part : parts) {
            String block = part.trim();
            if (block.isEmpty()) continue;

            boolean isGateway = GATEWAY_MARK.matcher(block).find()
                    || (block.toLowerCase(Locale.ROOT).contains("tasdiqlansa")
                        && block.toLowerCase(Locale.ROOT).contains("rad etilsa"));

            Matcher header = SECTION_HEADER.matcher(block);
            String label;
            if (header.find()) {
                label = header.group(1).trim();
                label = GATEWAY_MARK.matcher(label).replaceAll("").trim();
                label = label.replaceAll(":$", "").trim();
            } else {
                String first = block.split("\n")[0].replaceFirst("^\\d+[.)]\\s*", "").trim();
                label = GATEWAY_MARK.matcher(first).replaceAll("").trim();
            }

            label = shortLabel(label);
            if (label.isEmpty()) continue;
            nodes.add(isGateway ? Node.gateway(label) : Node.task(label));
        }
        return nodes;
    }

    private static boolean isSkipLine(String s) {
        String lower = s.toLowerCase(Locale.ROOT);
        return lower.startsWith("*")
                || lower.startsWith("•")
                || lower.startsWith("tasdiqlansa")
                || lower.startsWith("rad etilsa")
                || lower.startsWith("eslatma")
                || lower.startsWith("note:");
    }

    private static boolean looksLikeDecision(String s) {
        String lower = s.toLowerCase(Locale.ROOT);
        return lower.contains("?")
                || lower.contains("qaror")
                || lower.contains("baholash")
                || lower.contains("natija");
    }

    private static boolean wantsReject(String prompt) {
        String lower = prompt.toLowerCase(Locale.ROOT);
        return lower.contains("rad")
                || lower.contains("reject")
                || lower.contains("gateway")
                || lower.contains("tasdiq");
    }

    private static String shortLabel(String s) {
        if (s == null) return "";
        String t = s.trim()
                .replaceAll("(?i)\\[\\s*gateway\\s*\\]", "")
                .replaceAll("\\s+", " ")
                .replaceAll("[.!?]+$", "")
                .trim();
        if (t.contains(":") && t.indexOf(':') < 45) {
            String before = t.substring(0, t.indexOf(':')).trim();
            if (before.length() >= 3 && before.length() <= 45) {
                t = before;
            }
        }
        if (t.length() > 42) {
            t = t.substring(0, 39) + "...";
        }
        return t;
    }

    private static String suggestTitle(List<Node> nodes) {
        if (nodes.isEmpty()) return "Yangi jarayon";
        String t = nodes.get(0).name + (nodes.size() > 1 ? " jarayoni" : "");
        return t.length() > 100 ? t.substring(0, 97) + "..." : t;
    }

    private static List<String> nodeNames(List<Node> nodes) {
        List<String> names = new ArrayList<>();
        for (Node n : nodes) names.add(n.name);
        return names;
    }

    private static boolean hasGateway(List<Node> nodes) {
        for (Node n : nodes) if (n.gateway) return true;
        return false;
    }

    // --- BPMN XML ---

    private static String buildXml(List<Node> nodes) {
        StringBuilder process = new StringBuilder();
        StringBuilder diagram = new StringBuilder();

        final int y = 200;
        final int taskW = 130;
        final int taskH = 80;
        final int gap = 45;
        int x = 140;
        final int rejectY = 360;
        int rejectLaneX = 200;

        process.append("    <bpmn:startEvent id=\"Start_1\" name=\"Boshlash\">\n");
        process.append("      <bpmn:outgoing>Flow_start</bpmn:outgoing>\n");
        process.append("    </bpmn:startEvent>\n");
        shape(diagram, "Start_1", x, y - 18, 36, 36, true);

        String prevId = "Start_1";
        String prevFlow = "Flow_start";
        int prevOutX = x + 36;
        x += 36 + gap;

        boolean rejectEndCreated = false;
        int gwCount = 0;
        int taskCount = 0;

        for (int i = 0; i < nodes.size(); i++) {
            Node node = nodes.get(i);
            boolean last = (i == nodes.size() - 1);

            if (node.gateway) {
                gwCount++;
                String gwId = "Gw_" + gwCount;
                String flowNo = "Flow_no_" + gwCount;
                String flowOk = "Flow_ok_" + gwCount;

                // prev -> gateway
                process.append("    <bpmn:sequenceFlow id=\"").append(prevFlow)
                        .append("\" sourceRef=\"").append(prevId)
                        .append("\" targetRef=\"").append(gwId).append("\" />\n");
                edge(diagram, prevFlow, prevOutX, y, x, y);

                process.append("    <bpmn:exclusiveGateway id=\"").append(gwId)
                        .append("\" name=\"").append(escape(node.name)).append("\">\n");
                process.append("      <bpmn:incoming>").append(prevFlow).append("</bpmn:incoming>\n");
                process.append("      <bpmn:outgoing>").append(flowOk).append("</bpmn:outgoing>\n");
                process.append("      <bpmn:outgoing>").append(flowNo).append("</bpmn:outgoing>\n");
                process.append("    </bpmn:exclusiveGateway>\n");
                shapeGw(diagram, gwId, x, y - 25);

                if (!rejectEndCreated) {
                    process.append("    <bpmn:endEvent id=\"End_Rejected\" name=\"Rad etildi\" />\n");
                    shape(diagram, "End_Rejected", rejectLaneX, rejectY, 36, 36, true);
                    rejectEndCreated = true;
                }

                process.append("    <bpmn:sequenceFlow id=\"").append(flowNo)
                        .append("\" name=\"Rad\" sourceRef=\"").append(gwId)
                        .append("\" targetRef=\"End_Rejected\" />\n");
                edgeVia(diagram, flowNo, x + 25, y + 25, x + 25, rejectY + 18, rejectLaneX + 18, rejectY + 18);
                rejectLaneX += 70;

                if (last) {
                    process.append("    <bpmn:endEvent id=\"End_Ok\" name=\"Muvaffaqiyat\">\n");
                    process.append("      <bpmn:incoming>").append(flowOk).append("</bpmn:incoming>\n");
                    process.append("    </bpmn:endEvent>\n");
                    process.append("    <bpmn:sequenceFlow id=\"").append(flowOk)
                            .append("\" name=\"Ha\" sourceRef=\"").append(gwId)
                            .append("\" targetRef=\"End_Ok\" />\n");
                    int endX = x + 50 + gap;
                    shape(diagram, "End_Ok", endX, y - 18, 36, 36, true);
                    edge(diagram, flowOk, x + 50, y, endX, y);
                } else {
                    prevId = gwId;
                    prevFlow = flowOk;
                    prevOutX = x + 50;
                    x += 50 + gap;
                }
                continue;
            }

            taskCount++;
            String taskId = "Task_" + taskCount;
            String nextFlow = last ? "Flow_end" : ("Flow_t_" + taskCount);

            process.append("    <bpmn:sequenceFlow id=\"").append(prevFlow)
                    .append("\" sourceRef=\"").append(prevId)
                    .append("\" targetRef=\"").append(taskId).append("\" />\n");
            edge(diagram, prevFlow, prevOutX, y, x, y);

            process.append("    <bpmn:task id=\"").append(taskId)
                    .append("\" name=\"").append(escape(node.name)).append("\">\n");
            process.append("      <bpmn:incoming>").append(prevFlow).append("</bpmn:incoming>\n");
            process.append("      <bpmn:outgoing>").append(nextFlow).append("</bpmn:outgoing>\n");
            process.append("    </bpmn:task>\n");
            shape(diagram, taskId, x, y - taskH / 2, taskW, taskH, false);

            prevOutX = x + taskW;
            prevId = taskId;
            prevFlow = nextFlow;
            x += taskW + gap;

            if (last) {
                process.append("    <bpmn:endEvent id=\"End_Ok\" name=\"Muvaffaqiyat\">\n");
                process.append("      <bpmn:incoming>Flow_end</bpmn:incoming>\n");
                process.append("    </bpmn:endEvent>\n");
                process.append("    <bpmn:sequenceFlow id=\"Flow_end\" sourceRef=\"")
                        .append(taskId).append("\" targetRef=\"End_Ok\" />\n");
                shape(diagram, "End_Ok", x, y - 18, 36, 36, true);
                edge(diagram, "Flow_end", prevOutX, y, x, y);
            }
        }

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\"\n");
        xml.append("                  xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\"\n");
        xml.append("                  xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\"\n");
        xml.append("                  xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\"\n");
        xml.append("                  id=\"Definitions_Prompt\" targetNamespace=\"http://bpmn.io/schema/bpmn\">\n");
        xml.append("  <bpmn:process id=\"Process_Prompt\" isExecutable=\"false\">\n");
        xml.append(process);
        xml.append("  </bpmn:process>\n");
        xml.append("  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n");
        xml.append("    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_Prompt\">\n");
        xml.append(diagram);
        xml.append("    </bpmndi:BPMNPlane>\n");
        xml.append("  </bpmndi:BPMNDiagram>\n");
        xml.append("</bpmn:definitions>");
        return xml.toString();
    }

    private static void shape(StringBuilder d, String id, int x, int y, int w, int h, boolean label) {
        d.append("      <bpmndi:BPMNShape id=\"").append(id).append("_di\" bpmnElement=\"")
                .append(id).append("\">\n");
        d.append("        <dc:Bounds x=\"").append(x).append("\" y=\"").append(y)
                .append("\" width=\"").append(w).append("\" height=\"").append(h).append("\" />\n");
        if (label) {
            d.append("        <bpmndi:BPMNLabel><dc:Bounds x=\"").append(x - 10)
                    .append("\" y=\"").append(y + h + 5)
                    .append("\" width=\"70\" height=\"14\" /></bpmndi:BPMNLabel>\n");
        }
        d.append("      </bpmndi:BPMNShape>\n");
    }

    private static void shapeGw(StringBuilder d, String id, int x, int y) {
        d.append("      <bpmndi:BPMNShape id=\"").append(id).append("_di\" bpmnElement=\"")
                .append(id).append("\" isMarkerVisible=\"true\">\n");
        d.append("        <dc:Bounds x=\"").append(x).append("\" y=\"").append(y)
                .append("\" width=\"50\" height=\"50\" />\n");
        d.append("      </bpmndi:BPMNShape>\n");
    }

    private static void edge(StringBuilder d, String id, int x1, int y1, int x2, int y2) {
        d.append("      <bpmndi:BPMNEdge id=\"").append(id).append("_di\" bpmnElement=\"")
                .append(id).append("\">\n");
        d.append("        <di:waypoint x=\"").append(x1).append("\" y=\"").append(y1).append("\" />\n");
        d.append("        <di:waypoint x=\"").append(x2).append("\" y=\"").append(y2).append("\" />\n");
        d.append("      </bpmndi:BPMNEdge>\n");
    }

    private static void edgeVia(StringBuilder d, String id, int x1, int y1, int x2, int y2, int x3, int y3) {
        d.append("      <bpmndi:BPMNEdge id=\"").append(id).append("_di\" bpmnElement=\"")
                .append(id).append("\">\n");
        d.append("        <di:waypoint x=\"").append(x1).append("\" y=\"").append(y1).append("\" />\n");
        d.append("        <di:waypoint x=\"").append(x2).append("\" y=\"").append(y2).append("\" />\n");
        d.append("        <di:waypoint x=\"").append(x3).append("\" y=\"").append(y3).append("\" />\n");
        d.append("      </bpmndi:BPMNEdge>\n");
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    static final class Node {
        final String name;
        final boolean gateway;

        private Node(String name, boolean gateway) {
            this.name = name;
            this.gateway = gateway;
        }

        static Node task(String name) { return new Node(name, false); }
        static Node gateway(String name) { return new Node(name, true); }
    }

    public static final class GeneratedBpmn {
        private final String suggestedName;
        private final String xml;
        private final List<String> steps;
        private final boolean withReject;

        public GeneratedBpmn(String suggestedName, String xml, List<String> steps, boolean withReject) {
            this.suggestedName = suggestedName;
            this.xml = xml;
            this.steps = steps;
            this.withReject = withReject;
        }

        public String getSuggestedName() { return suggestedName; }
        public String getXml() { return xml; }
        public List<String> getSteps() { return steps; }
        public boolean isWithReject() { return withReject; }
    }
}
