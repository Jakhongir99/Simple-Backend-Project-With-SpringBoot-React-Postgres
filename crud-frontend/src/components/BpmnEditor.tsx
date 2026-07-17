import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
// @ts-expect-error - bpmn-js ships without bundled types for this entry
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

export interface BpmnEditorHandle {
  getXml: () => Promise<string>;
}

interface BpmnEditorProps {
  xml: string;
  height?: number;
}

/**
 * Editable BPMN canvas (palette + context pad). Parent gets the current XML
 * via the imperative `getXml()` handle when saving.
 */
export const BpmnEditor = forwardRef<BpmnEditorHandle, BpmnEditorProps>(
  ({ xml, height = 480 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const modelerRef = useRef<any>(null);

    useEffect(() => {
      if (!containerRef.current) return;
      const modeler = new Modeler({ container: containerRef.current });
      modelerRef.current = modeler;
      return () => {
        try {
          modeler.destroy();
        } catch {
          /* ignore */
        }
        modelerRef.current = null;
      };
    }, []);

    useEffect(() => {
      const modeler = modelerRef.current;
      if (!modeler || !xml) return;
      let cancelled = false;
      modeler
        .importXML(xml)
        .then(() => {
          if (cancelled) return;
          try {
            modeler.get("canvas").zoom("fit-viewport", "auto");
          } catch {
            /* ignore */
          }
        })
        .catch((e: unknown) => console.error("BPMN import error", e));
      return () => {
        cancelled = true;
      };
    }, [xml]);

    useImperativeHandle(ref, () => ({
      getXml: async () => {
        const modeler = modelerRef.current;
        if (!modeler) return xml;
        const { xml: out } = await modeler.saveXML({ format: true });
        return out as string;
      },
    }));

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
);

BpmnEditor.displayName = "BpmnEditor";

export default BpmnEditor;
