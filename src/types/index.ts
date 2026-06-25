// 数字资产类型定义
export interface DigitalAsset {
  id: string;
  category: AssetCategory;
  platform: string;
  accountName: string;
  notes: string;
  handler?: string; // 继承人/处理人
  action: AssetAction;
}

export type AssetCategory =
  | "social"      // 社交媒体
  | "payment"     // 支付/金融
  | "entertainment" // 娱乐资产
  | "creative"    // 创作资产
  | "other";      // 其他

export type AssetAction =
  | "transfer"    // 转移给亲友
  | "memorialize" // 纪念化
  | "delete"      // 删除
  | "undecided";  // 还没想好

// 告别信
export interface FarewellLetter {
  id: string;
  recipientName: string;
  relationship: string;
  content: string;
  triggerCondition?: string;
  createdAt: string;
  updatedAt: string;
}

// 遗愿清单
export interface WishlistItem {
  id: string;
  content: string;
  category: "travel" | "say" | "do" | "learn" | "other";
  priority: number; // 1-5
  status: "pending" | "done";
}

// AI响应类型
export interface InventoryAnalysis {
  assets: DigitalAsset[];
  summary: string;
  totalCount: number;
  suggestions: string;
}

export interface LetterDraft {
  draft: string;
  suggestions: string[];
  tone: string;
}

export interface WishlistAnalysis {
  items: WishlistItem[];
  summary: string;
  topPriority: WishlistItem;
}
