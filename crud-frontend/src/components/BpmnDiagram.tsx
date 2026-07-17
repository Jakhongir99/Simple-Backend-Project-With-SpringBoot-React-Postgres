import { useEffect, useRef } from "react";
// @ts-expect-error - bpmn-js ships without bundled types for this entry
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "./hiring.css";
import { HIRING_BPMN_XML, statusToNode, type HiringStatus } from "./hiringBpmn";

const ALL_NODES = [
  "Start_1",
  "Task_HR",
  "Gw_HR",
  "Task_Director",
  "Gw_Dir",
  "End_Hired",
  "End_Rejected",
];
const MARKERS = ["hl-active", "hl-done", "hl-rejected"];

interface BpmnDiagramProps {
  status?: HiringStatus;
  height?: number;
}

export function BpmnDiagram({ status, height = 340 }: BpmnDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const importedRef = useRef(false);

  // Create the viewer once
  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = new BpmnViewer({ container: containerRef.current });
    viewerRef.current = viewer;
    let cancelled = false;

    viewer
      .importXML(HIRING_BPMN_XML)
      .then(() => {
        if (cancelled) return;
        importedRef.current = true;
        try {
          viewer.get("canvas").zoom("fit-viewport", "auto");
        } catch {
          /* ignore */
        }
        applyMarker();
      })
      .catch((err: unknown) => console.error("BPMN import error", err));

    return () => {
      cancelled = true;
      importedRef.current = false;
      try {
        viewer.destroy();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyMarker = () => {
    const viewer = viewerRef.current;
    if (!viewer || !importedRef.current) return;
    const canvas = viewer.get("canvas");

    ALL_NODES.forEach((id) => {
      MARKERS.forEach((m) => {
        try {
          canvas.removeMarker(id, m);
        } catch {
          /* element may not exist */
        }
      });
    });

    if (!status) return;
    const node = statusToNode[status];
    if (!node) return;
    const marker =
      node.kind === "done"
        ? "hl-done"
        : node.kind === "rejected"
        ? "hl-rejected"
        : "hl-active";
    try {
      canvas.addMarker(node.elementId, marker);
    } catch {
      /* ignore */
    }
  };

  // Re-apply marker whenever the status changes
  useEffect(() => {
    applyMarker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        border: "1px solid var(--border-color, #dee2e6)",
        borderRadius: 8,
        background: "#fff",
      }}
    />
  );
}

export default BpmnDiagram;
