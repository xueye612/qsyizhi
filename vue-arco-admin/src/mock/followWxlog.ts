/** 企业微信（或院内消息通道）推送日志 — 模板、送达、失败原因（演示） */
export type WxPushStatus = '已送达' | '失败' | '已读' | '待确认';

export type FollowWxlogRow = {
  id: string;
  patientId: string;
  patientName: string;
  template: string;
  sentAt: string;
  status: WxPushStatus;
  errMsg?: string;
  maskId: string;
};

export function seedFollowWxlog(): FollowWxlogRow[] {
  return [
    {
      id: 'WX-20260416-001',
      patientId: 'P20260415008',
      patientName: '刘洋',
      template: '复查前一日提醒',
      sentAt: '2026-04-16 08:05:12',
      status: '已送达',
      maskId: 'oX***91a'
    },
    {
      id: 'WX-20260416-002',
      patientId: 'P20260415012',
      patientName: '张蕾',
      template: '检验结果已出-请查看',
      sentAt: '2026-04-16 07:55:03',
      status: '失败',
      errMsg: '用户拒收/黑名单',
      maskId: 'oY***b2c'
    },
    {
      id: 'WX-20260415-003',
      patientId: 'P20260415001',
      patientName: '王芳',
      template: '用药依从问卷',
      sentAt: '2026-04-15 19:30:00',
      status: '已读',
      maskId: 'oZ***c3d'
    },
    {
      id: 'WX-20260415-004',
      patientId: 'P20260415003',
      patientName: '李明',
      template: '随访任务待办',
      sentAt: '2026-04-15 14:12:44',
      status: '待确认',
      maskId: 'oA***d4e'
    },
    {
      id: 'WX-20260414-005',
      patientId: 'P20260415019',
      patientName: '任欣',
      template: '科普-排斥早期征象',
      sentAt: '2026-04-14 10:00:01',
      status: '已送达',
      maskId: 'oB***e5f'
    }
  ];
}

export function followWxlogKpis(rows: FollowWxlogRow[]) {
  const today = rows.filter((r) => r.sentAt.startsWith('2026-04-16')).length;
  const failed = rows.filter((r) => r.status === '失败').length;
  const readRate = rows.filter((r) => r.status === '已读').length;
  const pending = rows.filter((r) => r.status === '待确认').length;
  return { today, failed, readRate, pending, total: rows.length };
}
