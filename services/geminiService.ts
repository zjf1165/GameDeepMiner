
import { MineralItem, BlockType, QualityTier } from '../types';

// Rule-based appraisal system (Offline)

const APPRAISAL_QUOTES = {
  empty: [
    "空的？你在浪费我的时间。",
    "你是在逗我吗？货舱是空的！",
    "出去挖点东西再回来。",
  ],
  garbage: [
    "一堆石头和泥巴... 甚至不够付清理费。",
    "这就是你的收获？我还以为你是专业的。",
    "把这些垃圾倒掉，去挖点真正的矿。",
    "这种成色，我甚至不想给它估价。",
  ],
  poor: [
    "马马虎虎。这只能勉强维持生计。",
    "好吧，至少比空手而归强。",
    "这些矿石成色一般，但我会收下。",
    "只有这几块？还需要更加努力啊。",
  ],
  decent: [
    "不错的收获，继续保持。",
    "嗯，这些铜矿和铁矿看起来很结实。",
    "可以，这批货能卖个好价钱。",
    "今天的运气不错嘛，有些有用的东西。",
  ],
  rich: [
    "喔，不错！这可是好东西。",
    "看看这光泽！这批货我很满意。",
    "你找到矿脉了吗？成色真棒！",
    "很好，很好！这才是矿工该干的事。",
  ],
  jackpot: [
    "天哪！我们要发财了！",
    "难以置信！这是传说中的完美宝石！",
    "你把整座山都搬空了吗？太惊人了！",
    "我这辈子没见过这么完美的矿石！",
    "哇哦，满载而归！这可是大丰收啊。",
  ],
  rare_find: [
    "哦？看来你找到了些好东西。这块宝石成色不错。",
    "小心点放，这可是稀有货。",
    "这块宝石... 它的光芒令人着迷。",
  ]
};

const getRandomQuote = (category: keyof typeof APPRAISAL_QUOTES): string => {
  const quotes = APPRAISAL_QUOTES[category];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const getMineralAppraisal = async (inventory: MineralItem[]): Promise<string> => {
  // Simulate "Processing" time for realism
  await new Promise(resolve => setTimeout(resolve, 600));

  if (inventory.length === 0) {
    return getRandomQuote('empty');
  }

  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);
  
  const valuables = inventory.filter(item => 
    item.type !== BlockType.DIRT && 
    item.type !== BlockType.STONE && 
    item.type !== BlockType.HARD_STONE
  );

  const hasRare = inventory.some(i => 
    i.type === BlockType.DIAMOND || 
    i.type === BlockType.PAINITE || 
    i.type === BlockType.RUBY || 
    i.type === BlockType.EMERALD
  );
  
  const hasPristine = inventory.some(i => i.quality === QualityTier.PRISTINE);
  
  // Logic Tree
  if (valuables.length === 0) {
    return getRandomQuote('garbage');
  }

  if (totalValue > 5000 || (hasPristine && hasRare)) {
    return getRandomQuote('jackpot');
  }

  if (hasRare) {
    return getRandomQuote('rare_find');
  }

  if (totalValue > 1500) {
    return getRandomQuote('rich');
  }

  if (totalValue > 500) {
    return getRandomQuote('decent');
  }

  return getRandomQuote('poor');
};
