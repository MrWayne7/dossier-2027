import { onRequestGet as __api_comments_js_onRequestGet } from "/Users/mrwayne/Documents/2027 BUSSINESS/WEBSITE/WEBSITE V02/functions/api/comments.js"
import { onRequestPost as __api_comments_js_onRequestPost } from "/Users/mrwayne/Documents/2027 BUSSINESS/WEBSITE/WEBSITE V02/functions/api/comments.js"

export const routes = [
    {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_comments_js_onRequestGet],
    },
  {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_comments_js_onRequestPost],
    },
  ]