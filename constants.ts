
export const APP_NAME = "LinkGold";
export const XU_TO_VND = 1;
export const REFERRAL_COMMISSION = 0.05;

export const SOCIAL_LINKS = {
  ZALO: "https://zalo.me/g/example",
  TELEGRAM: "https://t.me/linkgold_support",
  YOUTUBE: "https://youtube.com/c/linkgold_official"
};

export const API_CONFIG = {
  link4m: {
    endpoint: "https://link4m.co/api-shorten/v2",
    key: "68208afab6b8fc60542289b6",
    paramName: "api"
  },
  yeumoney: {
    endpoint: "https://yeumoney.com/QL_api.php",
    key: "2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02",
    paramName: "token",
    extraParams: "&format=json"
  },
  linktot: {
    endpoint: "https://linktot.net/JSON_QL_API.php",
    key: "d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c",
    paramName: "token"
  },
  xlink: {
    endpoint: "https://xlink.co/api",
    key: "ac55663f-ef85-4849-8ce1-4ca99bd57ce7",
    paramName: "token"
  },
  traffictot: {
    endpoint: "https://services.traffictot.com/api/v1/shorten",
    key: "8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7",
    isPost: true
  },
  "4mmo": {
    endpoint: "https://4mmo.net/api",
    key: "e60502497c3ce642ca2e4d57515bd294ae0d8d93",
    paramName: "api"
  },
  linkngon: {
    endpoint: "https://linkngon.me/api",
    key: "AGnREGGD4gsCF9jLs5U3o6ARUuSeaeRAc8A3cL6TU4oZrq",
    paramName: "api"
  }
};

export const WITHDRAW_METHODS = [
  { id: 'BANK', name: 'Ngân hàng (ATM)', icon: 'fa-university' },
  { id: 'GARENA', name: 'Thẻ Garena', icon: 'fa-gamepad' }
];
