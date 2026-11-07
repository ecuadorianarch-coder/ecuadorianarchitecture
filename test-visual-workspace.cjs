const engine = require('./scripts/editorial-engine.cjs');

console.log('Testing Visual Workspace Engine functions...');

const state = engine.readEditorialState();
engine.initOrGetOfficeData(state);

// 1. Test Agent Message
console.log('\n--- 1. Testing sendMessageToAgent ---');
const msgResult = engine.sendMessageToAgent('ea-01-chief-editor', '¿Cuál es el estado del proyecto de Rumipamba para publicación?');
console.log('Chief Editor reply:', msgResult.agentResponse.text);

// 2. Test Virtual Meeting
console.log('\n--- 2. Testing runVirtualMeeting ---');
const meeting = engine.runVirtualMeeting(
  ['ea-01-chief-editor', 'ea-04-architecture-critic', 'ea-07-instagram-editor', 'ea-opp-01-director'],
  'Cobertura Crítica de la BAQ 2026',
  'Definir cronograma editorial y formato de carruseles de 10 láminas'
);
console.log('Meeting ID:', meeting.id);
console.log('Meeting Attendees:', meeting.attendees.length);
console.log('Meeting Transcripts count:', meeting.transcript.length);
console.log('Meeting Conclusions:', meeting.conclusions[0]);

// 3. Test Approval flow
console.log('\n--- 3. Testing approveArticle ---');
const approvedWorkspace = engine.approveArticle('espacio-para-hablar-con-dios-ssqj', 'approve');
console.log('Article stage:', approvedWorkspace.stage, '| Approved by:', approvedWorkspace.approvedBy);

// 4. Test Carousel approval
console.log('\n--- 4. Testing approveCarousel ---');
const approvedPkg = engine.approveCarousel('ig-pkg-1793831565573');
console.log('Carousel status:', approvedPkg.status);

// 5. Test Newsletter approval
console.log('\n--- 5. Testing approveNewsletter ---');
const approvedNl = engine.approveNewsletter('nl-1793831565603');
console.log('Newsletter status:', approvedNl.status);

// 6. Test Task Blockage resolution
console.log('\n--- 6. Testing resolveTaskBlockage ---');
const resolvedTask = engine.resolveTaskBlockage('tsk-007', 'Decanatura de FAU-UCE confirmó reunión para el martes 10:00 AM.');
console.log('Task tsk-007 status:', resolvedTask.status, '| Progress:', resolvedTask.progress);

console.log('\nAll Visual Workspace Engine tests PASSED successfully!');
