/**
 * 早教儿歌库（内置经典儿歌歌词，支持收藏）
 */

const RHYMES = [
  {
    id: 'twinkle',
    title: '小星星',
    category: '哄睡',
    lyric: '一闪一闪亮晶晶\n满天都是小星星\n挂在天上放光明\n好像许多小眼睛\n一闪一闪亮晶晶\n满天都是小星星'
  },
  {
    id: 'lullaby',
    title: '摇篮曲',
    category: '哄睡',
    lyric: '睡吧睡吧我亲爱的宝贝\n妈妈的双手轻轻摇着你\n摇篮摇你快快安睡\n夜已安静被里多温暖'
  },
  {
    id: 'bugs',
    title: '虫儿飞',
    category: '哄睡',
    lyric: '黑黑的天空低垂\n亮亮的繁星相随\n虫儿飞虫儿飞\n你在思念谁\n天上的星星流泪\n地上的玫瑰枯萎\n冷风吹冷风吹\n只要有你陪'
  },
  {
    id: 'tigers',
    title: '两只老虎',
    category: '游戏',
    lyric: '两只老虎两只老虎\n跑得快跑得快\n一只没有耳朵\n一只没有尾巴\n真奇怪真奇怪'
  },
  {
    id: 'ducks',
    title: '数鸭子',
    category: '认知',
    lyric: '门前大桥下游过一群鸭\n快来快来数一数二四六七八\n嘎嘎嘎嘎真呀真多呀\n数不清到底多少鸭\n赶鸭老爷爷胡子白花花\n唱呀唱着家乡戏还会说笑话'
  },
  {
    id: 'friends',
    title: '找朋友',
    category: '认知',
    lyric: '找呀找呀找朋友\n找到一个好朋友\n敬个礼握握手\n你是我的好朋友\n再见'
  },
  {
    id: 'swallow',
    title: '小燕子',
    category: '经典',
    lyric: '小燕子穿花衣\n年年春天来这里\n我问燕子你为啥来\n燕子说这里的春天最美丽'
  },
  {
    id: 'birthday',
    title: '生日快乐',
    category: '经典',
    lyric: '祝你生日快乐\n祝你生日快乐\n祝你生日快乐\n祝你生日快乐'
  },
  {
    id: 'mom',
    title: '世上只有妈妈好',
    category: '亲子',
    lyric: '世上只有妈妈好\n有妈的孩子像块宝\n投进妈妈的怀抱\n幸福享不了'
  },
  {
    id: 'pull',
    title: '拔萝卜',
    category: '游戏',
    lyric: '拔萝卜拔萝卜\n嗨吆嗨吆拔萝卜\n嗨吆嗨吆拔不动\n老太婆来帮忙\n拔萝卜拔萝卜'
  },
  {
    id: 'redhat',
    title: '小红帽',
    category: '经典',
    lyric: '我独自走在郊外的小路上\n我把糕点带给外婆尝一尝\n她家住在遥远又僻静的地方\n我要当心附近是否有大灰狼'
  },
  {
    id: 'painter',
    title: '粉刷匠',
    category: '经典',
    lyric: '我是一个粉刷匠粉刷本领强\n我要把那新房子刷得更漂亮\n刷了房顶又刷墙刷子飞舞忙\n哎呀我的小鼻子变呀变了样'
  },
  {
    id: 'jasmine',
    title: '茉莉花',
    category: '经典',
    lyric: '好一朵美丽的茉莉花\n好一朵美丽的茉莉花\n芬芳美丽满枝桠\n又香又白人人夸'
  },
  {
    id: 'sun',
    title: '种太阳',
    category: '经典',
    lyric: '我有一个美丽的愿望\n长大以后能播种太阳\n播种一个一个就够了\n会结出许多的许多的太阳'
  },
  {
    id: 'smile',
    title: '歌声与微笑',
    category: '经典',
    lyric: '请把我的歌带回你的家\n请把你的微笑留下\n明天明天这歌声\n飞遍海角天涯'
  },
  {
    id: 'snail',
    title: '蜗牛与黄鹂鸟',
    category: '经典',
    lyric: '阿门阿前一棵葡萄树\n阿嫩阿嫩绿地刚发芽\n蜗牛背着那重重的壳呀\n一步一步地往上爬'
  },
  {
    id: 'health',
    title: '健康歌',
    category: '游戏',
    lyric: '左三圈右三圈\n脖子扭扭屁股扭扭\n早睡早起咱们来做运动\n抖抖手啊抖抖脚啊\n勤做深呼吸'
  },
  {
    id: 'phone',
    title: '打电话',
    category: '认知',
    lyric: '两个小娃娃呀正在打电话呀\n喂喂喂你在哪里呀\n哎哎哎我在幼儿园'
  },
  {
    id: 'bears',
    title: '三只熊',
    category: '游戏',
    lyric: '有三只熊住在一起\n熊爸爸熊妈妈熊宝宝\n熊爸爸胖胖的\n熊妈妈很苗条\n熊宝宝很可爱'
  },
  {
    id: 'hug',
    title: '爱我你就抱抱我',
    category: '亲子',
    lyric: '爱我你就陪陪我\n爱我你就亲亲我\n爱我你就夸夸我\n爱我你就抱抱我'
  },
  {
    id: 'grandma',
    title: '外婆的澎湖湾',
    category: '亲子',
    lyric: '晚风轻拂澎湖湾白浪逐沙滩\n没有椰林缀斜阳只是一片海蓝蓝\n坐在门前的矮墙上一遍遍幻想\n也是黄昏的沙滩上有着脚印两对半'
  },
  {
    id: 'mushroom',
    title: '采蘑菇的小姑娘',
    category: '经典',
    lyric: '采蘑菇的小姑娘背着一个大竹筐\n清早光着小脚丫走遍森林和山冈\n她采的蘑菇最多多得像那星星数不清'
  },
  {
    id: 'abc',
    title: '字母歌',
    category: '认知',
    lyric: 'A B C D E F G\nH I J K L M N O P\nQ R S T U V W X\nY and Z\nNow I know my ABC\nNext time won\'t you sing with me'
  },
  {
    id: 'boat',
    title: '让我们荡起双桨',
    category: '经典',
    lyric: '让我们荡起双桨\n小船儿推开波浪\n海面倒映着美丽的白塔\n四周环绕着绿树红墙'
  }
]

const CATEGORIES = ['全部', '哄睡', '认知', '游戏', '亲子', '经典']

function getAll() { return RHYMES }
function getCategories() { return CATEGORIES }
function findById(id) { return RHYMES.find(r => r.id === id) }

module.exports = { getAll, getCategories, findById }
