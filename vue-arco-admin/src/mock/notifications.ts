/** Topbar 通知中心演示数据：演示 5 条混合类型 */

export type NotifyKind = 'alert' | 'task' | 'system' | 'message';

export type NotifyItem = {
  id: string;
  kind: NotifyKind;
  title: string;
  desc: string;
  ts: string;
  read: boolean;
  link?: string;
};

export function seedNotifications(): NotifyItem[] {
  return [
    {
      id: 'NT-001',
      kind: 'alert',
      title: '高严重度异常报警',
      desc: '患者刘洋 Scr 周环比 +18%，需在 24h 内复测',
      ts: '2026-04-16 09:10',
      read: false,
      link: '/ai/alert'
    },
    {
      id: 'NT-002',
      kind: 'task',
      title: '随访任务逾期',
      desc: '张蕾 电话随访任务已逾期 1 天，建议尽快闭环',
      ts: '2026-04-16 08:42',
      read: false,
      link: '/follow/tasks'
    },
    {
      id: 'NT-003',
      kind: 'message',
      title: '企业微信回复',
      desc: '宋雨 已回复 7 日血压问卷，请医师审阅',
      ts: '2026-04-16 08:05',
      read: false,
      link: '/follow/wxlog'
    },
    {
      id: 'NT-004',
      kind: 'system',
      title: '系统配置已更新',
      desc: 'Tac 谷浓度阈值由 5.0 调整为 5.2，请知悉',
      ts: '2026-04-15 19:30',
      read: true,
      link: '/sys/cfg'
    },
    {
      id: 'NT-005',
      kind: 'task',
      title: '报告解析完成',
      desc: '本日批次 12 份检验单结构化解析完成',
      ts: '2026-04-15 18:50',
      read: true,
      link: '/report/parse'
    }
  ];
}
