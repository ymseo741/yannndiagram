/**
 * 앱 전역 상수 (localStorage 키, 기본 색상, 초기 데이터)
 */
export const STORAGE_KEYS = {
  diagramData: 'ppt_diagram_data_v8',
  savedScenarios: 'ppt_diagram_saves',
};

export const DEFAULT_COLOR = '#F8FAFC';
export const ROOT_COLOR = '#2563EB';

export const INITIAL_DATA = [
  {
    id: 'root',
    text: '메인 시스템\\n아키텍처',
    color: ROOT_COLOR,
    textColor: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    children: [
      {
        id: 'c1',
        text: '데이터 계층',
        color: '#DBEAFE',
        textColor: '#1E293B',
        fontSize: 20,
        fontWeight: '500',
        children: [
          { id: 'g1', text: '센서 커넥터', color: DEFAULT_COLOR, fontSize: 18 },
          { id: 'g2', text: '레거시 DB', color: DEFAULT_COLOR, fontSize: 18 },
        ],
      },
      {
        id: 'c2',
        text: '서비스 계층',
        color: '#DCFCE7',
        textColor: '#1E293B',
        fontSize: 20,
        fontWeight: '500',
        children: [
          { id: 'g3', text: 'API 서버', color: DEFAULT_COLOR, fontSize: 18 },
          { id: 'g4', text: '인증 모듈', color: DEFAULT_COLOR, fontSize: 18 },
        ],
      },
    ],
  },
];
