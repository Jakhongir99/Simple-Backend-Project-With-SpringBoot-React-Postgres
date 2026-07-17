// Hand-authored BPMN 2.0 diagram for the hiring workflow.
// Flow: Ariza berildi -> HR ko'rib chiqadi -> (qaror) -> Director tasdiqlaydi -> (qaror) -> Ishga olindi / Rad etildi
export const HIRING_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_Hiring"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="HiringProcess" isExecutable="false">
    <bpmn:startEvent id="Start_1" name="Ariza berildi">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_HR" name="HR ko&#39;rib chiqadi">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gw_HR" name="HR qarori">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_Director" name="Director tasdiqlaydi">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gw_Dir" name="Director qarori">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="End_Hired" name="Ishga olindi">
      <bpmn:incoming>Flow_6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="End_Rejected" name="Rad etildi">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:incoming>Flow_7</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_HR" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_HR" targetRef="Gw_HR" />
    <bpmn:sequenceFlow id="Flow_3" name="Tasdiqlandi" sourceRef="Gw_HR" targetRef="Task_Director" />
    <bpmn:sequenceFlow id="Flow_4" name="Rad etildi" sourceRef="Gw_HR" targetRef="End_Rejected" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_Director" targetRef="Gw_Dir" />
    <bpmn:sequenceFlow id="Flow_6" name="Tasdiqlandi" sourceRef="Gw_Dir" targetRef="End_Hired" />
    <bpmn:sequenceFlow id="Flow_7" name="Rad etildi" sourceRef="Gw_Dir" targetRef="End_Rejected" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="HiringProcess">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1">
        <dc:Bounds x="152" y="182" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="140" y="225" width="64" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_HR_di" bpmnElement="Task_HR">
        <dc:Bounds x="240" y="160" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gw_HR_di" bpmnElement="Gw_HR" isMarkerVisible="true">
        <dc:Bounds x="420" y="175" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="418" y="145" width="54" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Director_di" bpmnElement="Task_Director">
        <dc:Bounds x="530" y="160" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gw_Dir_di" bpmnElement="Gw_Dir" isMarkerVisible="true">
        <dc:Bounds x="710" y="175" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="700" y="145" width="72" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Hired_di" bpmnElement="End_Hired">
        <dc:Bounds x="820" y="182" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="810" y="225" width="60" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Rejected_di" bpmnElement="End_Rejected">
        <dc:Bounds x="560" y="320" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="552" y="363" width="54" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="200" />
        <di:waypoint x="240" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="360" y="200" />
        <di:waypoint x="420" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="470" y="200" />
        <di:waypoint x="530" y="200" />
        <bpmndi:BPMNLabel><dc:Bounds x="476" y="182" width="60" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="445" y="225" />
        <di:waypoint x="445" y="338" />
        <di:waypoint x="560" y="338" />
        <bpmndi:BPMNLabel><dc:Bounds x="451" y="300" width="54" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="650" y="200" />
        <di:waypoint x="710" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="760" y="200" />
        <di:waypoint x="820" y="200" />
        <bpmndi:BPMNLabel><dc:Bounds x="766" y="182" width="60" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="735" y="225" />
        <di:waypoint x="735" y="338" />
        <di:waypoint x="596" y="338" />
        <bpmndi:BPMNLabel><dc:Bounds x="640" y="320" width="54" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export type HiringStatus =
  | "SUBMITTED"
  | "HR_APPROVED"
  | "REJECTED_BY_HR"
  | "HIRED"
  | "REJECTED_BY_DIRECTOR";

// Which BPMN node is "active" for a given status, and how to color it.
export const statusToNode: Record<
  HiringStatus,
  { elementId: string; kind: "active" | "done" | "rejected" }
> = {
  SUBMITTED: { elementId: "Task_HR", kind: "active" },
  HR_APPROVED: { elementId: "Task_Director", kind: "active" },
  HIRED: { elementId: "End_Hired", kind: "done" },
  REJECTED_BY_HR: { elementId: "End_Rejected", kind: "rejected" },
  REJECTED_BY_DIRECTOR: { elementId: "End_Rejected", kind: "rejected" },
};
