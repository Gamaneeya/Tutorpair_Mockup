import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReportNotification,pushReportNotification,verifyLiffIdToken} from './line-service.mjs';
const id='U'+'a'.repeat(32);
test('Flex card uses authenticated report link and contains no student private details',()=>{
  const msg=buildReportNotification({reportUrl:'https://example.test/parent/progress.html'});
  assert.equal(msg.type,'flex');
  assert.equal(msg.contents.footer.contents[0].action.uri,'https://example.test/parent/progress.html');
  assert.ok(!JSON.stringify(msg).includes('studentId'));
});
test('Push uses LINE endpoint, authorized token and recipient',async()=>{
  let called=false;
  const res=await pushReportNotification({lineUserId:id,reportUrl:'https://example.test/parent/progress.html',channelAccessToken:'fake-token',fetchImpl:async(url,options)=>{
    called=true;
    assert.equal(url,'https://api.line.me/v2/bot/message/push');
    assert.equal(options.headers.Authorization,'Bearer fake-token');
    assert.equal(JSON.parse(options.body).to,id);
    return {ok:true,status:200};
  }});
  assert.ok(called);assert.ok(res.accepted);
});
test('LIFF ID token must be verified by LINE, and server uses verified sub',async()=>{
  const res=await verifyLiffIdToken({idToken:'test-id-token',lineLoginChannelId:'123456789',fetchImpl:async(url,options)=>{
    assert.equal(url,'https://api.line.me/oauth2/v2.1/verify');
    assert.equal(options.body.get('client_id'),'123456789');
    return {ok:true,json:async()=>({sub:id,aud:'123456789'})};
  }});
  assert.equal(res.lineUserId,id);
});
test('Rejects insecure links, missing secrets and forged audience',async()=>{
  assert.throws(()=>buildReportNotification({reportUrl:'http://example.test'}));
  await assert.rejects(pushReportNotification({lineUserId:id,reportUrl:'https://example.test',channelAccessToken:''}));
  await assert.rejects(verifyLiffIdToken({idToken:'x',lineLoginChannelId:'123',fetchImpl:async()=>({ok:true,json:async()=>({sub:id,aud:'other'})})}));
});
