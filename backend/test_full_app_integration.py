import os
os.environ['DATABASE_URL'] = 'sqlite:///./standbharat_local.db'

from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    # 1. Unauthenticated agent catalog
    res = client.get('/api/agents')
    assert res.status_code == 200, f'Status {res.status_code}: {res.text}'
    agents = res.json()
    assert len(agents) == 15, f'Expected 15 agents, got {len(agents)}'
    print(f'1. Verified 15 Agents in catalog')

    # 2. Login
    login_res = client.post('/api/auth/login', json={'email': 'demo@standbharat.ai', 'password': 'demo'})
    assert login_res.status_code == 200
    token = login_res.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print(f'2. Login verified, token obtained')

    # 3. Workspaces
    ws_res = client.get('/api/workspaces/', headers=headers)
    ws_id = ws_res.json()[0]['id']
    headers['X-Workspace-ID'] = ws_id
    print(f'3. Workspace retrieved: {ws_id}')

    # 4. Brand
    br_res = client.get('/api/brands/', headers=headers)
    brand_id = br_res.json()[0]['id']
    headers['X-Brand-ID'] = brand_id
    print(f'4. Brand retrieved: {brand_id}')

    # 5. Members & Invite
    members_res = client.get(f'/api/workspaces/{ws_id}/members', headers=headers)
    assert members_res.status_code == 200
    print(f'5. Initial workspace members: {len(members_res.json())}')

    invite_res = client.post(f'/api/workspaces/{ws_id}/members', json={'email': 'growth@standbharat.ai', 'role': 'MARKETER'}, headers=headers)
    assert invite_res.status_code == 200
    members_after = client.get(f'/api/workspaces/{ws_id}/members', headers=headers).json()
    assert len(members_after) >= 2
    print(f'6. Teammate invitation verified: {len(members_after)} members')

    # 7. Plan & Upgrade
    plan_res = client.get(f'/api/workspaces/{ws_id}/plan', headers=headers)
    assert plan_res.status_code == 200
    print(f'7. Current plan tier: {plan_res.json()["plan_tier"]}, quota: {plan_res.json()["monthly_credit_quota"]}')

    upgrade_res = client.post(f'/api/workspaces/{ws_id}/upgrade', json={'plan': 'PRO'}, headers=headers)
    assert upgrade_res.status_code == 200
    plan_pro = client.get(f'/api/workspaces/{ws_id}/plan', headers=headers).json()
    assert plan_pro['plan_tier'] == 'PRO'
    assert plan_pro['monthly_credit_quota'] == 1000000
    print(f'8. Plan upgrade to PRO verified: {plan_pro["monthly_credit_quota"]} credits')

    # 9. Campaigns
    camp_create = client.post('/api/campaigns/', json={'name': 'Q4 AI Search Visibility', 'budget': 75000, 'status': 'ACTIVE'}, headers=headers)
    assert camp_create.status_code == 200
    assert camp_create.json()['name'] == 'Q4 AI Search Visibility'
    camps = client.get('/api/campaigns/', headers=headers).json()
    assert len(camps) >= 1
    print(f'9. Campaign creation & listing verified ({len(camps)} campaigns)')

    # 10. Opportunities
    opp_create = client.post('/api/opportunities/', json={'title': 'Target Generative Engine Optimization', 'impact': 'HIGH', 'priority': 95, 'confidence': '90%'}, headers=headers)
    assert opp_create.status_code == 200, f"Opp create failed: {opp_create.status_code} - {opp_create.text}"
    opp_id = opp_create.json()['id']
    opps = client.get('/api/opportunities/', headers=headers).json()
    assert len(opps) >= 1
    print(f'10. Opportunity created & listed ({len(opps)} opportunities)')

    # 11. Content Drafts
    draft_create = client.post('/api/content/drafts', json={'title': 'GEO Optimization Blueprint', 'content_type': 'blog', 'body': 'Autonomous generative search strategy.'}, headers=headers)
    assert draft_create.status_code == 200
    drafts = client.get('/api/content/drafts', headers=headers).json()
    assert len(drafts) >= 1
    print(f'11. Content draft creation & listing verified ({len(drafts)} drafts)')

    # 12. Agent Execution
    run_res = client.post('/api/agents/growth/run', json={'input_data': {'experiment': 'viral referral loop'}}, headers=headers)
    assert run_res.status_code == 200
    run_id = run_res.json()['run_id']
    poll_res = client.get(f'/api/agent-runs/{run_id}', headers=headers)
    assert poll_res.status_code == 200
    print(f'12. Agent execution verified: run_id={run_id}, status={poll_res.json()["status"]}')

    # 13. AI CMO Chat
    cmo_res = client.post('/api/ai/cmo/chat', json={'message': 'What should we focus on this week?'}, headers=headers)
    assert cmo_res.status_code == 200
    resp_text = cmo_res.json()['response']
    assert len(resp_text) > 20
    print(f'13. AI CMO Chat synthesis verified: {resp_text[:60]}...')

    print('\n======================================================')
    print('ALL 13 FULL-APPLICATION INTEGRATION TESTS PASSED!')
    print('======================================================')
