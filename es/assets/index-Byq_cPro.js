const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Home-J0trjPys.js","assets/_plugin-vue_export-helper-1tPrXgE0.js","assets/Projects-ZhyImSum.js"])))=>i.map(i=>d[i]);
import { watch, ref, onMounted, resolveComponent, createElementBlock, openBlock, createElementVNode, createVNode, withDirectives, createTextVNode, toDisplayString, unref, withCtx, createBlock, resolveDynamicComponent, withKeys, isRef, vModelText, shallowRef, defineComponent, computed, reactive, inject, h, provide, nextTick, createApp } from "vue";
import { defineStore, storeToRefs, createPinia } from "pinia";
import axios from "axios";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled = function(promises$2) {
      return Promise.all(promises$2.map((p$1) => Promise.resolve(p$1).then((value$1) => ({
        status: "fulfilled",
        value: value$1
      }), (reason) => ({
        status: "rejected",
        reason
      }))));
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = allSettled(deps.map((dep) => {
      dep = assetsURL(dep);
      if (dep in seen) return;
      seen[dep] = true;
      const isCss = dep.endsWith(".css");
      const cssSelector = isCss ? '[rel="stylesheet"]' : "";
      if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
      const link = document.createElement("link");
      link.rel = isCss ? "stylesheet" : scriptRel;
      if (!isCss) link.as = "script";
      link.crossOrigin = "";
      link.href = dep;
      if (cspNonce) link.setAttribute("nonce", cspNonce);
      document.head.appendChild(link);
      if (isCss) return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
      });
    }));
  }
  function handlePreloadError(err$2) {
    const e$1 = new Event("vite:preloadError", { cancelable: true });
    e$1.payload = err$2;
    window.dispatchEvent(e$1);
    if (!e$1.defaultPrevented) throw err$2;
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
class Core {
  static dataSource;
}
const useWhiteboxRoutes = defineStore("whitebox-routes", {
  state: () => {
    return {
      documentRoutes: {},
      reverseRoutes: {},
      projection: {},
      routes: [],
      currentRefId: decodeURI(window.location.pathname)
    };
  },
  getters: {
    collections() {
      const collections = {};
      for (let name in this.documentRoutes[this.currentRefId].collections) {
        let collection = this.documentRoutes[this.currentRefId].collections[name];
        if (collection.documents) {
          collections[name] = collection.documents.map((document2) => {
            return {
              loaded: true,
              meta: document2.data.meta,
              link: encodeURI(document2.refId),
              content: document2.data.content
            };
          });
          collections[name].loaded = true;
        } else {
          collections[name] = [];
          collections[name].loaded = false;
        }
        if (collection.error) {
          collections[name].error = collection.error;
        }
      }
      return collections;
    },
    documentRoute() {
      return this.documentRoutes[this.currentRefId];
    }
  },
  actions: {
    async loadRoute(refId, to, from) {
      const documentsStore = useWhiteboxDocuments();
      const loadDocuments = [];
      const documentRoute = this.documentRoutes[refId];
      const document2 = documentsStore.sitemap[documentRoute.document.meta.lang][documentRoute.href];
      for (let name in documentRoute.collections) {
        let collection = await documentRoute.collections[name].query({
          meta: document2.data.meta,
          link: encodeURI(document2.refId)
        }, to, from);
        if (collection) {
          if (!Array.isArray(collection)) {
            collection = [collection];
          }
          loadDocuments.push(
            documentsStore.loadDocuments(collection).then((documents) => {
              documentRoute.collections[name].documents = documents;
            }).catch((error) => {
              documentRoute.collections[name].error = error;
              throw error;
            })
          );
        }
      }
      return Promise.all(loadDocuments);
    },
    async loadRoutes({ documentRoutes, reverseRoutes, routeDefinitions }) {
      Object.assign(this.documentRoutes, documentRoutes);
      Object.assign(this.reverseRoutes, reverseRoutes);
      console.log("Routes:", Object.keys(routeDefinitions).length);
      const documents = await Core.dataSource.loadSitemap();
      let routes = [];
      for (let document2 of documents) {
        if (!document2.data?.meta?.component) continue;
        const routeDefinition = routeDefinitions[document2.data.meta.component];
        this.reverseRoutes[document2.data.meta.href] = this.reverseRoutes[document2.data.meta.href] || [];
        this.reverseRoutes[document2.data.meta.href].push({
          refId: document2.refId,
          document: document2.data,
          endpoint: "mikser"
        });
        let collections = {};
        if (routeDefinition?.meta?.collections) {
          for (let collectionName in routeDefinition.meta.collections) {
            collections[collectionName] = {
              query: routeDefinition.meta.collections[collectionName]
            };
          }
        }
        this.documentRoutes[document2.refId] = {
          href: document2.data.meta.href,
          document: document2.data,
          endpoint: "mikser",
          collections
        };
        if (routeDefinition) {
          routes.push({
            path: encodeURI(document2.refId),
            component: routeDefinition.component,
            meta: routeDefinition.meta,
            alias: ["/" + document2.data.meta.lang + document2.data.meta.href],
            props: this.documentRoutes[document2.refId]
          });
          if (document2.data.meta.route) {
            let documentMeta = { ...routeDefinition.meta };
            documentMeta.refId = document2.refId;
            if (documentMeta.documents) {
              if (Array.isArray(documentMeta.documents)) {
                documentMeta.documents = [document2.refId, ...documentMeta.documents];
              } else {
                documentMeta.documents = [document2.refId, documentMeta.documents];
              }
            } else {
              documentMeta.documents = document2.refId;
            }
            routes.push({
              path: encodeURI(document2.refId) + document2.data.meta.route,
              component: routeDefinition.component,
              meta: documentMeta,
              props: this.documentRoutes[document2.refId]
            });
          }
        }
      }
      console.log("Routes:", routes, Date.now() - window.startTime + "ms");
      this.routes = routes;
      return routes;
    }
  }
});
let feedPool = {};
const useWhiteboxDocuments = defineStore("whitebox-documents", {
  state: () => {
    return {
      sitemap: {},
      context: {}
    };
  },
  getters: {
    document() {
      const routesStore = useWhiteboxRoutes();
      if (!routesStore.documentRoute) return;
      let document2 = this.href(routesStore.documentRoute.href, routesStore.documentRoute.document.meta.lang);
      document2.documentRoute = routesStore.documentRoute;
      return document2;
    },
    alternates: (state) => (href) => {
      let documents = [];
      for (let lang of state.sitemap) {
        let document2 = state.sitemap[lang][href];
        if (document2) documents.push(document2);
      }
      return documents;
    },
    href: (state) => (href, lang, loaded) => {
      const routesStore = useWhiteboxRoutes();
      let hash = (href || "").split(/(?=[<#])/)[1];
      href = (href || "").split("#")[0];
      if (typeof lang == "boolean") {
        loaded = lang;
        lang = void 0;
      }
      lang = lang || routesStore.documentRoute && routesStore.documentRoute.document.meta.lang || document.documentElement.lang || "";
      let hreflang = state.sitemap[lang];
      if (hreflang) {
        let document2 = hreflang[href];
        if (document2) {
          return {
            loaded: true,
            meta: document2.data.meta,
            link: encodeURI(document2.refId),
            content: document2.data.content,
            location: {
              path: encodeURI(document2.refId),
              hash
            }
          };
        } else {
          let reverse = routesStore.reverseRoutes[href];
          if (reverse) {
            let route = reverse.find((record) => record.document.meta.lang == lang);
            if (route && !loaded) {
              return {
                link: encodeURI(route.refId),
                location: {
                  path: encodeURI(route.refId),
                  hash
                },
                meta: {}
              };
            }
          }
        }
      }
      if (loaded) return;
      return {
        meta: {},
        link: encodeURI("/" + lang + href)
      };
    },
    hrefs: (state) => (regex, lang, loaded) => {
      const routesStore = useWhiteboxRoutes();
      if (typeof lang == "boolean") {
        loaded = lang;
        lang = void 0;
      }
      if (typeof regex == "string") {
        regex = new RegExp(regex);
      }
      lang = lang || routesStore.documentRoute && routesStore.documentRoute.document.meta.lang || document.documentElement.lang || "";
      let hreflang = state.sitemap[lang];
      if (hreflang) {
        const documents = Object.keys(routesStore.reverseRoutes).filter((href) => regex.test(href)).map((href) => {
          let document2 = hreflang[href];
          if (document2) {
            return {
              loaded: true,
              meta: document2.data.meta,
              link: encodeURI(document2.refId)
            };
          } else {
            let reverse = routesStore.reverseRoutes[href];
            let route = reverse.find((record) => record.document.meta.lang == lang);
            if (route) {
              return {
                link: encodeURI(route.refId),
                meta: {}
              };
            }
          }
        }).filter((document2) => document2);
        if (loaded) {
          if (!documents.find((document2) => !document2.loaded)) return documents;
        }
        return documents;
      }
      return [];
    }
  },
  actions: {
    updateDocument(document2) {
      let href = document2.data.meta.href || document2.refId;
      let lang = document2.data.meta.lang || "";
      if (!this.sitemap[lang]) {
        this.sitemap[lang] = {};
      } else {
        let oldDocument = this.sitemap[lang][href];
        if (oldDocument && oldDocument.stamp >= document2.stamp) return;
      }
      this.sitemap[lang][href] = Object.freeze(document2);
    },
    assignDocuments(documents) {
      this.$patch((state) => {
        for (let document2 of documents) {
          let href = document2.data.meta.href || document2.data.refId;
          let lang = document2.data.meta.lang || "";
          if (!state.sitemap[lang]) state.sitemap[lang] = {};
          const currentDocument = state.sitemap[lang][href];
          if (!currentDocument || currentDocument.stamp != document2.stamp) {
            state.sitemap[lang][href] = Object.freeze(document2);
          }
        }
      });
      console.log("Load time:", Date.now() - window.startTime + "ms");
    },
    loadDocuments(items) {
      if (!items) items = [];
      const result = [];
      const routesStore = useWhiteboxRoutes();
      let loading = [];
      let refIds = [];
      for (let item of items) {
        if (typeof item == "string") {
          if (routesStore.documentRoute) {
            if (routesStore.reverseRoutes[item]) {
              let reverseRefIds = routesStore.reverseRoutes[item].filter(
                (reverse) => reverse.document.meta.lang == routesStore.documentRoute.document.meta.lang && (!this.sitemap[routesStore.documentRoute.document.meta.lang] || !this.sitemap[routesStore.documentRoute.document.meta.lang][item])
              ).map((reverse) => reverse.refId).filter((refId) => feedPool[refId] == void 0);
              refIds.push(
                ...reverseRefIds
              );
              reverseRefIds.forEach((refId) => feedPool[refId] = Date.now());
            } else {
              let documentRefId = decodeURI(item);
              if (feedPool[documentRefId] == void 0) {
                let documentRoute = routesStore.documentRoutes[documentRefId];
                if (documentRoute && !this.href(documentRoute.href, documentRoute.document.meta.lang, true)) {
                  refIds.push(documentRefId);
                  feedPool[documentRefId] = Date.now();
                }
              }
            }
          }
        } else {
          const itemId = JSON.stringify(item);
          if (feedPool[itemId] == void 0) {
            feedPool[itemId] = [];
            loading.push(
              Core.dataSource.loadDocumentsByQuery(item).then((documents) => {
                feedPool[itemId].push(...documents);
                result.push(...feedPool[itemId]);
                this.assignDocuments(documents);
              })
            );
          } else {
            result.push(...feedPool[itemId]);
          }
        }
      }
      loading.push(
        Core.dataSource.loadDocuments(refIds).then((documents) => {
          result.push(...documents);
          this.assignDocuments(documents);
        })
      );
      return Promise.all(loading).then(() => result);
    },
    loadContext() {
      const routesStore = useWhiteboxRoutes();
      return Core.dataSource.loadContext(routesStore.currentRefId).then((context) => this.context = context);
    }
  }
});
function normalizeDocument(document2) {
  document2.meta = document2.feed[Object.keys(document2.feed)[0]].meta;
  delete document2.feed;
  return document2;
}
const useWhiteboxSearches = defineStore("whitebox-searches", {
  state: () => {
    return {
      searchMap: {}
    };
  },
  getters: {
    hits: (state) => (name) => {
      return state.searchMap[name];
    }
  },
  actions: {
    match(name, query, options2) {
      return this.search(name, {
        must: {
          match: query
        }
      }, options2);
    },
    multiMatch(name, query, options2) {
      return this.search(name, {
        must: {
          multi_match: query
        }
      }, options2);
    },
    combinedFields(name, query, options2) {
      return this.search(name, {
        must: {
          combined_fields: query
        }
      }, options2);
    },
    queryString(name, query, options2) {
      return this.search(name, {
        must: {
          query_string: query
        }
      }, options2);
    },
    search(name, query, options2 = {}) {
      return new Promise((resolve) => {
        this.searchMap[name] = [];
        this.searchMap[name].loaded = false;
        if (!window.whitebox) return resolve([]);
        window.whitebox.init("feed", (feed) => {
          let data = {
            context: Core.dataSource.dataContext,
            vault: "feed",
            query: {
              bool: {
                filter: {
                  terms: {
                    "context.keyword": Core.dataSource.queryContext
                  }
                },
                ...query
              }
            },
            ...options2
          };
          feed.service.catalogs.mikser.search(data).then((documents) => {
            this.searchMap[name] = documents.map(normalizeDocument);
            this.searchMap[name].loaded = true;
            resolve(documents);
          }).catch((error) => {
            this.searchMap[name].error = error;
          });
        });
      });
    }
  }
});
function metaField(type, field) {
  return "feed.*-" + type.toLowerCase() + ".meta." + field;
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = { randomUUID };
function v4(options2, buf, offset) {
  if (native.randomUUID && true && !options2) {
    return native.randomUUID();
  }
  options2 = options2 || {};
  const rnds = options2.random ?? options2.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
const version = "7.0.0";
axios.defaults.withCredentials = true;
function sha256(val) {
  if (typeof val == "object") {
    val = JSON.stringify(val);
  }
  if (!crypto.subtle) return val;
  return crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(val)).then((h2) => {
    let hexes = [], view = new DataView(h2);
    for (let i = 0; i < view.byteLength; i += 4) {
      hexes.push(("00000000" + view.getUint32(i).toString(16)).slice(-8));
    }
    return hexes.join("");
  });
}
function localKey(key) {
  return key + "@" + version.split(".")[0];
}
function removeUndefined(obj, mutate = false, recursive = 0) {
  const returnObj = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val === void 0) {
      if (mutate) {
        delete obj[key];
      }
    } else {
      let recursiveVal;
      if (recursive > 0 && val !== null && typeof val === "object") {
        recursiveVal = removeUndefined(val, mutate, typeof recursive === "number" ? recursive - 1 : true);
      }
      if (!mutate) {
        returnObj[key] = recursiveVal || val;
      }
    }
  });
  return mutate ? obj : returnObj;
}
function getFbp() {
  let result = /_fbp=(fb\.1\.\d+\.\d+)/.exec(window.document.cookie);
  if (!(result && result[1])) return null;
  return result[1];
}
function getFbc() {
  let result = /_fbc=(fb\.1\.\d+\.\d+)/.exec(window.document.cookie);
  if (!(result && result[1])) {
    if (window.location.search.includes("fbclid=")) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      fbc = "fb.1." + +/* @__PURE__ */ new Date() + "." + urlParams.get("fbclid");
      return fbc;
    } else {
      return null;
    }
  }
  return result[1];
}
function items2gtag(items) {
  if (!items) return {};
  return {
    items: items.map((item, index) => {
      return {
        item_id: item.itemId,
        item_name: item.name,
        affiliation: item.affiliation,
        coupon: item.coupon,
        currency: item.currency,
        discount: item.discount,
        index,
        item_brand: item.brand,
        item_category: (item.categories || [])[0],
        item_category2: (item.categories || [])[1],
        item_category3: (item.categories || [])[2],
        item_category4: (item.categories || [])[3],
        item_category5: (item.categories || [])[4],
        item_list_id: item.listId,
        item_list_name: item.listName,
        item_variant: item.variant,
        location_id: item.locationId,
        price: (item.price || 0).toFixed(2),
        quantity: item.quantity || 1
      };
    }),
    currency: items[0].currency,
    value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2)
  };
}
function items2fbq(items) {
  if (!items) return {};
  return {
    content_ids: items.map((item) => item.itemId.toString()),
    content_type: "product",
    contents: items.map((item) => {
      return {
        id: item.itemId.toString(),
        quantity: item.quantity || 1
      };
    }),
    content_name: items.map((item) => item.name).join(", "),
    currency: items[0].currency,
    value: items.reduce((sum, item) => sum + (item.quantity || 1) * ((item.price || 0) - (item.discount || 0)), 0).toFixed(2)
  };
}
const useWhiteboxTracking = defineStore("whitebox-tracking", {
  state: () => {
    return {
      identities: [],
      options: {}
    };
  },
  actions: {
    async trackFacebook(track, event, context = {}) {
      const eventId = v4();
      if (window.fbq) {
        window.fbq(track, event, context, { eventID: eventId });
      }
      window.whitebox?.init("analytics", async () => {
        const { connect } = window.whitebox.services;
        let data = {
          event,
          eventId,
          context,
          url: window.location.href,
          timestamp: Date.now()
        };
        let userId = localStorage.getItem(localKey("whiteboxUserId")) || await sha256(connect.runtime.fingerprint);
        data.identities = [
          ...this.identities,
          {
            id: "fingerprint",
            name: "userId",
            value: userId
          }
        ];
        if (connect.runtime.sst) {
          await axios.post(`${connect.runtime.url}/track`, data, {
            headers: {
              "Authorization": "Bearer " + connect.runtime.tokens.connect,
              "Fingerprint": connect.runtime.fingerprint
            }
          }).catch(console.error);
        }
      });
    },
    trackContext(data = {}) {
      return new Promise((resolve) => {
        window.whitebox?.init("analytics", (analytics) => {
          if (analytics) {
            const { analytics: analytics2 } = window.whitebox.services;
            data.vaultId = analytics2.runtime.vaultId;
            axios.post(`${analytics2.runtime.url}/context`, data, {
              headers: {
                "Authorization": "Bearer " + analytics2.runtime.token,
                "Fingerprint": analytics2.runtime.fingerprint
              }
            }).catch(console.error).then(resolve);
          } else {
            resolve();
          }
        });
      });
    },
    async identity(identities, userName = "email") {
      if (!window.whitebox) return;
      const { connect } = window.whitebox.services;
      let userId = await sha256(connect.runtime.fingerprint);
      return axios.post(`${connect.runtime.url}/identity`, {
        identities
      }, {
        headers: {
          "Authorization": "Bearer " + connect.runtime.tokens.connect,
          "Fingerprint": connect.runtime.fingerprint
        }
      }).then(async (response) => {
        let diff = false;
        const currentIdentities = [...this.identities];
        console.log("Current identities:", currentIdentities);
        for (let identity of response.data.identities) {
          let userIdentiy = currentIdentities.find(({ key, name }) => key == identity.key && name == identity.name);
          if (userIdentiy && userIdentiy.value != identity.value) {
            userIdentiy.value = identity.value;
            diff = true;
          } else if (!userIdentiy) {
            this.identities.push(identity);
            diff = true;
          }
          const userInfo = this.identities.find(({ name }) => name == userName)?.value;
          if (userInfo) {
            userId = await sha256(userInfo);
            localStorage.setItem(localKey("whiteboxUserId"), userId);
          }
        }
        if (diff) {
          console.log("Track identity");
          if (window.fbq) {
            window.fbq("init", this.options.fbq, removeUndefined({
              em: this.identities.find(({ name }) => name == "email")?.value,
              ph: this.identities.find(({ name }) => name == "e164")?.value.replace("+", ""),
              fn: this.identities.find(({ name }) => name == "firstname")?.value,
              ln: this.identities.find(({ name }) => name == "lastname")?.value,
              db: this.identities.find(({ name }) => name == "birthdate")?.value.replace(/\//g, ""),
              ge: this.identities.find(({ name }) => name == "gender")?.value,
              country: this.identities.find(({ name }) => name == "country")?.value,
              external_id: userId,
              client_ip_address: window.whitebox.services.connect.runtime.ip,
              client_user_agent: window.navigator.userAgent
            }));
          }
          if (window.gtag) {
            if (Array.isArray(this.options.gtag)) {
              for (let tagId of this.options.gtag) {
                window.gtag("config", tagId, {
                  user_id: userId
                });
              }
            } else {
              window.gtag("config", this.options.gtag, {
                user_id: userId
              });
            }
            window.gtag("set", "user_data", removeUndefined({
              email: this.identities.find(({ name }) => name == "email")?.value,
              phone_number: this.identities.find(({ name }) => name == "e164")?.value,
              address: {
                first_name: this.identities.find(({ name }) => name == "firstname")?.value,
                last_name: this.identities.find(({ name }) => name == "lastname")?.value,
                city: this.identities.find(({ name }) => name == "city")?.value,
                country: this.identities.find(({ name }) => name == "country")?.value,
                region: this.identities.find(({ name }) => name == "region")?.value,
                street: this.identities.find(({ name }) => name == "street")?.value,
                postal_code: this.identities.find(({ name }) => name == "postalcode")?.value
              }
            }, false, 1));
          }
        }
      });
    },
    async start(options2) {
      if (options2) {
        this.options = options2;
      }
      window.whitebox?.init("analytics", async () => {
        const { connect } = window.whitebox.services;
        let userId = localStorage.getItem(localKey("whiteboxUserId")) || await sha256(connect.runtime.fingerprint);
        const fbp = getFbp();
        if (fbp) {
          this.identities.push({ id: "fingerprint", name: "fbp", value: fbp });
          console.log("Fbp:", fbp);
        }
        const fbc2 = getFbc();
        if (fbc2) {
          this.identities.push({ id: "fingerprint", name: "fbc", value: fbc2 });
          console.log("Fbc:", fbp);
        }
        if (window.fbq) {
          window.fbq("init", this.options.fbq, {
            external_id: userId
          });
        }
        if (window.gtag) {
          window.gtag("js", /* @__PURE__ */ new Date());
          if (Array.isArray(this.options.gtag)) {
            for (let tagId of this.options.gtag) {
              window.gtag("config", tagId, {
                user_id: userId
              });
            }
          } else {
            window.gtag("config", this.options.gtag, {
              user_id: userId
            });
          }
        }
        await this.trackFacebook("track", "PageView");
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.has("utm_source")) {
          const source = urlParams.get("utm_source");
          const medium = urlParams.get("utm_medium");
          const campaign = urlParams.get("utm_campaign");
          console.log("Track utm:", source, medium, campaign);
          let event = "Utm" + source.charAt(0).toUpperCase() + source.slice(1);
          await this.trackFacebook("trackCustom", event, {
            source,
            medium,
            campaign
          });
        }
      });
      window.whitebox?.init("shortener", (shortener) => {
        if (shortener) {
          if (shortener.service.data?.email || shortener.service.data?.phone) {
            this.contact(shortener.service.data);
          }
        }
      });
      this.session();
    },
    custom(action, data) {
      window.whitebox?.services?.analytics?.context(action, data) || window.whitebox?.init("analytics", (analytics) => analytics.service.context(action, data));
    },
    async pageView() {
      console.log("Track page view:", decodeURI(window.location.pathname));
      if (window.gtag) {
        window.gtag("set", "page_path", decodeURI(window.location.pathname));
        window.gtag("event", "page_view");
      }
      window.whitebox?.init("analytics", (analytics) => {
        if (analytics) {
          analytics.service.info();
        }
      });
    },
    async addToCart(items) {
      console.log("Track add to cart:", items.map((item) => item.name).join(", "));
      if (window.gtag) {
        window.gtag("event", "add_to_cart", items2gtag(items));
      }
      await this.trackFacebook("track", "AddToCart", items2fbq(items));
      await this.trackContext({
        action: "addToCart",
        context: items
      });
    },
    async removeFromCart(items) {
      console.log("Track remove from cart:", items.map((item) => item.name).join(", "));
      if (window.gtag) {
        window.gtag("event", "remove_from_cart", items2gtag(items));
      }
      await this.trackContext({
        action: "removeFromCart",
        context: items
      });
    },
    async addToWishlist(items) {
      console.log("Track add to wishlist:", items.map((item) => item.name).join(", "));
      if (window.gtag) {
        window.gtag("event", "add_to_wishlist", items2gtag(items));
      }
      await this.trackFacebook("track", "AddToWishlist", items2fbq(items));
      await this.trackContext({
        action: "addToWishlist",
        context: items
      });
    },
    async completeRegistration(method) {
      console.log("Track complete registration:", method);
      if (window.gtag) {
        window.gtag("event", "sign_up", { method });
      }
      await this.trackFacebook("track", "CompleteRegistration", { content_name: method });
      await this.trackContext({
        action: "completeRegistration",
        context: method
      });
    },
    async lead(info) {
      console.log("Track lead:", info.currency, info.value);
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          currency: info.currency,
          value: info.value
        });
      }
      await this.trackFacebook("track", "Lead", {
        content_name: info.name,
        content_category: info.category,
        currency: info.currency,
        value: info.value
      });
      await this.trackContext({
        action: "lead",
        context: info
      });
    },
    async contact(info) {
      console.log("Track contact");
      if (window.gtag) {
        window.gtag("event", "contact", {
          event_label: info.name,
          event_category: info.category
        });
      }
      await this.trackFacebook("track", "Contact", {
        content_name: info.name,
        content_category: info.category
      });
      await this.trackContext({
        action: "contact",
        context: info
      });
    },
    async findLocation(location2) {
      console.log("Track find location:", location2.category, location2.locationId);
      if (window.gtag) {
        window.gtag("event", "select_content", {
          content_type: location2.category ? "location_" + location2.category : "location",
          item_id: location2.locationId
        });
      }
      await this.trackFacebook("track", "FindLocation", {
        content_category: location2.category ? "location_" + location2.category : "location",
        content_name: location2.locationId
      });
      await this.trackContext({
        action: "findLocation",
        context: location2.locationId
      });
    },
    async initiateCheckout(items) {
      console.log("Track initiate checkout:", items?.map((item) => item.name).join(", "));
      if (window.gtag) {
        window.gtag("event", "begin_checkout", items2gtag(items));
      }
      await this.trackFacebook("track", "InitiateCheckout", items2fbq(items));
      await this.trackContext({
        action: "initiateCheckout",
        context: items
      });
    },
    async purchase(items) {
      console.log("Track purchase:", items.map((item) => item.name).join(", "));
      if (window.gtag) {
        window.gtag("event", "purchase", items2gtag(items));
      }
      await this.trackFacebook("track", "Purchase", {
        ...items2fbq(items),
        transaction_id: v4()
      });
      await this.trackContext({
        action: "purchase",
        context: items
      });
    },
    async schedule() {
      console.log("Track schedule");
      await this.trackFacebook("track", "Schedule");
      await this.trackContext({
        action: "schedule"
      });
    },
    async search(term) {
      console.log("Track lead:", term);
      if (window.gtag) {
        window.gtag("event", "search", {
          search_term: term
        });
      }
      await this.trackFacebook("track", "Search", { search_string: term });
      await this.trackContext({
        action: "search",
        context: term
      });
    },
    async startTrial(info) {
      console.log("Track start trail:", info.currency, info.value, info.predictedLtv);
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          currency: info.currency,
          value: info.value
        });
      }
      await this.trackFacebook("track", "StartTrial", {
        currency: info.currency,
        value: info.value,
        predicted_ltv: info.predictedLtv
      });
      await this.trackContext({
        action: "startTrial",
        context: info
      });
    },
    async subscribe(info = {}) {
      console.log("Track subscribe:", info.currency, info.value, info.predictedLtv);
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          currency: info.currency,
          value: info.value || 0
        });
      }
      await this.trackFacebook("track", "Subscribe", {
        currency: info.currency,
        value: info.value || 0,
        predicted_ltv: info.predictedLtv || 0
      });
      await this.trackContext({
        action: "subscribe",
        context: info
      });
    },
    async viewContent(info = {}) {
      console.log("Track view content:", info.category, info.name, info.contentId, info.currency, info.value);
      if (window.gtag) {
        window.gtag("event", "select_content", {
          content_type: info.category,
          item_id: info.contentId
        });
      }
      await this.trackFacebook("track", "ViewContent", {
        content_ids: [info.contentId],
        content_name: info.name,
        content_category: info.category,
        currency: info.currency,
        value: info.value
      });
      await this.trackContext({
        action: "viewContent",
        context: info
      });
    },
    async login(method) {
      console.log("Track login:", method);
      if (window.gtag) {
        window.gtag("event", "login", { method });
      }
      await this.trackContext({
        action: "login",
        context: method
      });
    },
    async customizeProduct(info = {}) {
      console.log("Track customize product");
      await this.trackFacebook("track", "CustomizeProduct");
      await this.trackContext({
        action: "customizeProduct",
        context: info
      });
    },
    async session() {
      let pages = (Number(localStorage.getItem("whiteboxPages")) || 0) + 1;
      let last = new Date(Number(localStorage.getItem("whiteboxLastVisit")) || Date.now());
      let sessions = Number(localStorage.getItem("whiteboxSessions")) || 1;
      if (last - Date.now() > 3 * 60 * 1e3) {
        sessions++;
      }
      if (pages > 1) {
        console.log("Track session:", sessions, pages);
        await this.trackFacebook("trackCustom", "Session", {
          pages,
          sessions
        });
      }
      localStorage.setItem("whiteboxPages", pages);
      localStorage.setItem("whiteboxLastVisit", Date.now());
      localStorage.setItem("whiteboxSessions", sessions);
    },
    async watch(info = {}) {
      console.log("Track watch:", info.percent, info.current, info.total);
      if (window.gtag) {
        window.gtag("event", "watch", {
          content_type: info.category,
          item_id: info.contentId,
          percent: info.percent,
          current: info.current,
          total: info.total
        });
      }
      await this.trackFacebook("trackCustom", "Watch", {
        content_ids: [info.contentId],
        content_name: info.name,
        content_category: info.category,
        percent: info.percent,
        current: info.current,
        total: info.total
      });
      await this.trackContext({
        action: "watch",
        context: info
      });
    }
  }
});
const useWhiteboxPassports = defineStore("whitebox-passsports", {
  state: () => {
    return {
      passport: {}
    };
  },
  actions: {
    async start() {
      window.whitebox?.init("passports", (passports) => {
        if (passports) {
          this.passport = window.whitebox.services.passports?.passport || {};
          window.whitebox.emmiter.on("passports.denounce", function() {
            setTimeout(this.$reset, 3e3);
          });
          window.whitebox.emmiter.on("passports.passport", (passport) => {
            this.passport = passport;
          });
        }
      });
    },
    async load() {
      if (window.whitebox.services.passports) {
        const { passport } = await window.whitebox.services.passports.load();
        this.passport = passport;
      }
    }
  }
});
function onDocumentChanged(callback) {
  const routesStore = useWhiteboxRoutes();
  const { currentRefId } = storeToRefs(routesStore);
  watch(currentRefId, callback);
}
function onCollectionLoaded(collection, callback) {
  const documentsStore = useWhiteboxDocuments();
  const routesStore = useWhiteboxRoutes();
  watch(documentsStore.document.documentRoute.collections[collection], () => callback(routesStore.collections[collection]));
}
const _hoisted_1 = { class: "debug" };
const _hoisted_2 = { class: "debug" };
const _sfc_main = {
  __name: "App",
  setup(__props) {
    let count = ref(0);
    let query = ref("");
    function increment() {
      count++;
    }
    const documents = useWhiteboxDocuments();
    documents.loadDocuments(["/web/translation"]);
    onDocumentChanged((newValue, oldValue) => console.log("Document changed:", oldValue, "→", newValue));
    onCollectionLoaded("items", (items) => console.log("Collection loaded:", items));
    function search() {
      const searches = useWhiteboxSearches();
      searches.multiMatch("projects", {
        query: query.value,
        fields: [
          metaField("Project", "company"),
          metaField("Project", "title"),
          metaField("Project", "overview")
        ],
        type: "phrase_prefix"
      });
    }
    onMounted(() => {
      const tracking = useWhiteboxTracking();
      tracking.start();
      const passports = useWhiteboxPassports();
      passports.start();
    });
    return (_ctx, _cache) => {
      const _component_router_link = resolveComponent("router-link");
      const _component_router_view = resolveComponent("router-view");
      return openBlock(), createElementBlock("div", null, [
        _cache[3] || (_cache[3] = createElementVNode("h1", null, "WhiteBox Core", -1)),
        createElementVNode("button", { onClick: increment }, toDisplayString(unref(count)), 1),
        createElementVNode("nav", null, [
          createVNode(_component_router_link, { to: "/" }, {
            default: withCtx(() => _cache[1] || (_cache[1] = [
              createTextVNode("Home")
            ])),
            _: 1,
            __: [1]
          })
        ]),
        createElementVNode("nav", null, [
          createVNode(_component_router_link, {
            to: _ctx.$href("/web/projects").link
          }, {
            default: withCtx(() => _cache[2] || (_cache[2] = [
              createTextVNode("Projects")
            ])),
            _: 1,
            __: [2]
          }, 8, ["to"])
        ]),
        createVNode(_component_router_view, null, {
          default: withCtx(({ Component }) => [
            (openBlock(), createBlock(resolveDynamicComponent(Component)))
          ]),
          _: 1
        }),
        createElementVNode("div", _hoisted_1, toDisplayString(_ctx.$href("/web/translation")) + " " + toDisplayString(_ctx.$storage("/storage/animations/client-graphs.json")), 1),
        _cache[4] || (_cache[4] = createElementVNode("h2", null, "Search", -1)),
        withDirectives(createElementVNode("input", {
          type: "text",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(query) ? query.value = $event : query = $event),
          onKeyup: withKeys(search, ["enter"])
        }, null, 544), [
          [vModelText, unref(query)]
        ]),
        _cache[5] || (_cache[5] = createTextVNode()),
        createElementVNode("button", { onClick: search }, "Search"),
        _cache[6] || (_cache[6] = createElementVNode("br", null, null, -1)),
        _cache[7] || (_cache[7] = createElementVNode("br", null, null, -1)),
        createElementVNode("div", _hoisted_2, toDisplayString(_ctx.$hits("projects")), 1)
      ]);
    };
  }
};
const useWhiteboxFiles = defineStore("whitebox-files", {
  state: () => {
    return {
      filemap: {}
    };
  },
  actions: {
    storage(file, cache) {
      if (!file) return file;
      return this.link(file, { cache });
    },
    asset(preset, file, format, cache) {
      if (!file) return file;
      let asset = `/assets/${preset}${format ? file.split(".").slice(0, -1).concat(format).join(".") : file}`;
      return this.link(asset, { cache });
    },
    link(file, options2) {
      Core.dataSource.getLink(file, options2).then((link) => {
        if (this.filemap[file] != link) this.filemap[file] = link;
      });
      return this.filemap[file] || "";
    },
    sharedStorage(file) {
      Core.dataSource.getSharedLink(file, options).then((link) => {
        if (this.filemap[file] != link) this.filemap[file] = link;
      });
      return this.filemap[file] || "";
    }
  }
});
class WhiteboxDataSource {
  constructor({ context, shared = "", preloadDocuments = false }) {
    this.context = context;
    this.shared = shared;
    this.preloadDocuments = preloadDocuments;
    if (this.shared) {
      this.dataContext = [this.context || "mikser", this.shared];
    } else {
      this.dataContext = [this.context || "mikser"];
    }
    this.queryContext = this.dataContext.map((context2) => {
      if (context2 == "mikser") return context2;
      return "mikser_" + context2;
    });
  }
  loadSitemap() {
    return new Promise((resolve, reject) => {
      if (!window.whitebox) return resolve([]);
      window.whitebox.init("feed", (feed) => {
        let data = {
          context: this.dataContext,
          vault: "feed",
          query: {
            context: {
              $in: this.queryContext
            }
          },
          projection: {
            "refId": 1,
            "data.meta.href": 1,
            "data.meta.route": 1,
            "data.meta.lang": 1,
            "data.meta.layout": 1,
            "data.meta.component": 1
          },
          cache: "1h"
        };
        if (feed.service.catalogs.mikser) {
          feed.service.catalogs.mikser.find(data).then((documents) => {
            for (let document2 of documents) {
              document2.data.meta.component ||= document2.data.meta.layout;
            }
            console.log("Whitebox sitemap context:", this.dataContext, "Documents:", documents);
            resolve(documents);
          }).catch(reject);
        } else {
          console.warn("Whitebox sitemap is missing");
          resolve([]);
        }
      });
    });
  }
  loadDocuments(refIds) {
    return new Promise((resolve) => {
      if (!window.whitebox) return resolve([]);
      window.whitebox.init("feed", (feed) => {
        if (refIds.length) {
          const data = {
            vault: "feed",
            cache: "1h",
            context: this.dataContext,
            query: {
              context: {
                $in: this.queryContext
              },
              refId: {
                $in: refIds
              }
            }
          };
          feed.service.catalogs.mikser.find(data).then((documents) => {
            console.log("Whitebox load documents:", refIds, documents);
            resolve(documents);
          });
        } else {
          resolve([]);
        }
      });
    });
  }
  loadDocumentsByQuery(query) {
    return new Promise((resolve) => {
      if (!window.whitebox) return resolve([]);
      window.whitebox.init("feed", (feed) => {
        let data = {};
        if (query.query) {
          data = query;
        } else {
          data.query = query;
        }
        data.context = this.dataContext;
        data.query.context = {
          $in: this.queryContext
        };
        data.vault = "feed";
        feed.service.catalogs.mikser.find(data).then(resolve);
      });
    });
  }
  liveReload(callback) {
    if (!window.whitebox) return;
    window.whitebox.init("feed", (feed) => {
      window.whitebox.emmiter.on("feed.change", (change) => {
        if (change.type != "ready") console.log("Feed change:", change);
        else if (change.type == "initial" || change.type == "change") {
          let document2 = change.new;
          if (!document2) return;
          callback(document2);
        }
      });
      let data = {
        vault: "feed",
        context: callback,
        query: this.queryContext.reduce((query, context) => {
          if (!query) {
            return `item("context").eq("${context}")`;
          }
          return query += `.or(item("context").eq("${context}"))`;
        }, ""),
        initial: this.preloadDocuments
      };
      feed.service.catalogs.mikser.changes(data);
    });
  }
  getLink(file, options2 = {}) {
    const { context, cache = true } = options2;
    return new Promise((resolve) => {
      window.whitebox.init("storage", (storage) => {
        if (storage) {
          let data = {
            file,
            cache
          };
          if (this.context != "mikser") {
            data.context = this.context;
          }
          if (context) {
            data.context = context;
          }
          let result = storage.service.link(data);
          if (typeof result == "string") {
            resolve(result);
          } else {
            result.then((link) => {
              resolve(link);
            });
          }
        }
      });
    });
  }
  getSharedLink(file) {
    if (!file) return file;
    if (file.indexOf("/storage") != 0 && file.indexOf("storage") != 0) {
      if (file[0] == "/") file = "/storage" + file;
      else file = "/storage/" + file;
    }
    return this.getLink(file, { context: this.shared });
  }
}
const navigation = {
  install: (app) => {
    const router = app.config.globalProperties.$router;
    router.beforeEach((to, from, next) => {
      const routesStore = useWhiteboxRoutes();
      const documentsStore = useWhiteboxDocuments();
      let documents = [];
      const toRefId = decodeURI(to.path);
      let documentRoute = routesStore.documentRoutes[toRefId];
      if (documentRoute) {
        documents.push(to.path);
      }
      for (let matched of to.matched) {
        if (matched.meta.documents) {
          if (Array.isArray(matched.meta.documents)) {
            documents.push(...matched.meta.documents);
          } else {
            documents.push(matched.meta.documents);
          }
        }
        if (matched.meta.refId) {
          documentRoute = routesStore.documentRoutes[matched.meta.refId];
          documents.unshift(matched.meta.refId);
        }
      }
      documentsStore.loadDocuments(documents).then(() => {
        next();
      }).catch((err) => next(err));
    });
    router.afterEach((to, from) => {
      const routesStore = useWhiteboxRoutes();
      routesStore.currentRefId = router.currentRoute.value.refId || decodeURI(router.currentRoute.value.path);
      routesStore.loadRoute(routesStore.currentRefId, to, from).catch(console.error);
    });
  }
};
async function createMikser({ router, store, dataSource, options: options2 }) {
  Core.dataSource = dataSource || new WhiteboxDataSource({
    context: options2.context,
    shared: options2.shared ? "shared" : ""
  });
  const routesStore = useWhiteboxRoutes(store);
  let routeDefinitions = {};
  for (let route of router.options.routes) {
    routeDefinitions[route.name] = route;
  }
  let routes = await routesStore.loadRoutes({ ...options2, routeDefinitions });
  for (let route of routes.filter((route2) => route2.component)) {
    router.addRoute(route);
  }
  return {
    install(app) {
      app.use(navigation);
      Object.defineProperty(app.config.globalProperties, "$href", {
        get() {
          const documentsStore = useWhiteboxDocuments();
          return documentsStore.href;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$document", {
        get() {
          const documentsStore = useWhiteboxDocuments();
          return documentsStore.document;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$context", {
        get() {
          const documentsStore = useWhiteboxDocuments();
          return documentsStore.context;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$alternates", {
        get() {
          const documentsStore = useWhiteboxDocuments();
          return documentsStore.alternates;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$storage", {
        get() {
          const filesStore = useWhiteboxFiles();
          return filesStore.storage;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$asset", {
        get() {
          const filesStore = useWhiteboxFiles();
          return filesStore.asset;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$dataSource", {
        get() {
          return Core.dataSource;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$collections", {
        get() {
          const routesStore2 = useWhiteboxRoutes();
          return routesStore2.collections;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$hits", {
        get() {
          const searchesStore = useWhiteboxSearches();
          return searchesStore.hits;
        }
      });
      Object.defineProperty(app.config.globalProperties, "$track", {
        get() {
          const tracking2 = useWhiteboxTracking();
          return {
            identity: tracking2.identity,
            custom: tracking2.custom,
            addToCart: tracking2.addToCart,
            removeFromCart: tracking2.removeFromCart,
            addToWishlist: tracking2.addToWishlist,
            completeRegistration: tracking2.completeRegistration,
            lead: tracking2.lead,
            contact: tracking2.contact,
            findLocation: tracking2.findLocation,
            initiateCheckout: tracking2.initiateCheckout,
            purchase: tracking2.purchase,
            schedule: tracking2.schedule,
            search: tracking2.search,
            startTrial: tracking2.startTrial,
            subscribe: tracking2.subscribe,
            viewContent: tracking2.viewContent,
            customizeProduct: tracking2.customizeProduct,
            watch: tracking2.watch
          };
        }
      });
      if (Core.dataSource.liveReload) {
        const documentsStore = useWhiteboxDocuments(store);
        Core.dataSource.liveReload(documentsStore.updateDocument);
      }
      const tracking = useWhiteboxTracking(store);
      tracking.options = options2;
      onDocumentChanged(() => {
        tracking.pageView();
      });
    }
  };
}
defineStore("whitebox-shortener", {
  state: () => {
    return {
      data: {}
    };
  },
  actions: {
    async loadData() {
      return new Promise((resolve) => {
        window.whitebox?.init("shortener", (shortener) => {
          if (shortener) {
            shortener.service.load().then((data) => {
              this.data = data;
              resolve(data);
            });
          }
        });
      });
    },
    async link(url, data) {
      return new Promise((resolve) => {
        if (!window.whitebox) return resolve([]);
        window.whitebox.init("shortener", (shortener) => {
          if (shortener) {
            shortener.service.link(url, data).then(resolve);
          }
        });
      });
    }
  }
});
class MikserDataSource {
  constructor({ baseUrl = "", documentName = "document", contextName = "context" } = {}) {
    this.baseUrl = baseUrl;
    this.documentName = documentName;
    this.contextName = contextName;
  }
  async loadSitemap() {
    const response = await fetch(`${this.baseUrl}/data/mikser.json`);
    const documents = await response.json();
    return documents;
  }
  loadDocuments(refIds) {
    return Promise.all(refIds.map((refId) => {
      if (refId == "/") refId = "/index";
      return fetch(`${this.baseUrl}/data/${refId}${this.documentName ? "." + this.documentName : ""}.json`).then((responese) => responese.json());
    }));
  }
  loadContext(refId) {
    if (refId == "/") refId = "/index";
    return fetch(`${this.baseUrl}/data/${refId}.${this.contextName}.json`).then((responese) => responese.json());
  }
  async loadDocumentsByQuery(query) {
    const response = await fetch(`${this.baseUrl}/data/${query.path || query}.json`);
    const documents = await response.json();
    return documents;
  }
  async getLink(file) {
    return `${window.location.origin}${file}`;
  }
}
/*!
  * vue-router v4.1.6
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */
const isBrowser = typeof window !== "undefined";
function isESModule(obj) {
  return obj.__esModule || obj[Symbol.toStringTag] === "Module";
}
const assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = isArray(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
const noop = () => {
};
const isArray = Array.isArray;
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery2, location2, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const hashPos = location2.indexOf("#");
  let searchPos = location2.indexOf("?");
  if (hashPos < searchPos && hashPos >= 0) {
    searchPos = -1;
  }
  if (searchPos > -1) {
    path = location2.slice(0, searchPos);
    searchString = location2.slice(searchPos + 1, hashPos > -1 ? hashPos : location2.length);
    query = parseQuery2(searchString);
  }
  if (hashPos > -1) {
    path = path || location2.slice(0, hashPos);
    hash = location2.slice(hashPos, location2.length);
  }
  path = resolveRelativePath(path != null ? path : location2, currentLocation);
  return {
    fullPath: path + (searchString && "?") + searchString + hash,
    path,
    query,
    hash
  };
}
function stringifyURL(stringifyQuery2, location2) {
  const query = location2.query ? stringifyQuery2(location2.query) : "";
  return location2.path + (query && "?") + query + (location2.hash || "");
}
function stripBase(pathname, base) {
  if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
    return pathname;
  return pathname.slice(base.length) || "/";
}
function isSameRouteLocation(stringifyQuery2, a, b) {
  const aLastIndex = a.matched.length - 1;
  const bLastIndex = b.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery2(a.query) === stringifyQuery2(b.query) && a.hash === b.hash;
}
function isSameRouteRecord(a, b) {
  return (a.aliasOf || a) === (b.aliasOf || b);
}
function isSameRouteLocationParams(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length)
    return false;
  for (const key in a) {
    if (!isSameRouteLocationParamsValue(a[key], b[key]))
      return false;
  }
  return true;
}
function isSameRouteLocationParamsValue(a, b) {
  return isArray(a) ? isEquivalentArray(a, b) : isArray(b) ? isEquivalentArray(b, a) : a === b;
}
function isEquivalentArray(a, b) {
  return isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
function resolveRelativePath(to, from) {
  if (to.startsWith("/"))
    return to;
  if (!to)
    return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (segment === ".")
      continue;
    if (segment === "..") {
      if (position > 1)
        position--;
    } else
      break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join("/");
}
var NavigationType;
(function(NavigationType2) {
  NavigationType2["pop"] = "pop";
  NavigationType2["push"] = "push";
})(NavigationType || (NavigationType = {}));
var NavigationDirection;
(function(NavigationDirection2) {
  NavigationDirection2["back"] = "back";
  NavigationDirection2["forward"] = "forward";
  NavigationDirection2["unknown"] = "";
})(NavigationDirection || (NavigationDirection = {}));
function normalizeBase(base) {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector("base");
      base = baseEl && baseEl.getAttribute("href") || "/";
      base = base.replace(/^\w+:\/\/[^\/]+/, "");
    } else {
      base = "/";
    }
  }
  if (base[0] !== "/" && base[0] !== "#")
    base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location2) {
  return base.replace(BEFORE_HASH_RE, "#") + location2;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.pageXOffset,
  top: window.pageYOffset
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else {
    scrollToOptions = position;
  }
  if ("scrollBehavior" in document.documentElement.style)
    window.scrollTo(scrollToOptions);
  else {
    window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.pageXOffset, scrollToOptions.top != null ? scrollToOptions.top : window.pageYOffset);
  }
}
function getScrollKey(path, delta) {
  const position = history.state ? history.state.position - delta : -1;
  return position + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
let createBaseLocation = () => location.protocol + "//" + location.host;
function createCurrentLocation(base, location2) {
  const { pathname, search, hash } = location2;
  const hashPos = base.indexOf("#");
  if (hashPos > -1) {
    let slicePos = hash.includes(base.slice(hashPos)) ? base.slice(hashPos).length : 1;
    let pathFromHash = hash.slice(slicePos);
    if (pathFromHash[0] !== "/")
      pathFromHash = "/" + pathFromHash;
    return stripBase(pathFromHash, "");
  }
  const path = stripBase(pathname, base);
  return path + search + hash;
}
function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;
  const popStateHandler = ({ state }) => {
    const to = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;
    if (state) {
      currentLocation.value = to;
      historyState.value = state;
      if (pauseState && pauseState === from) {
        pauseState = null;
        return;
      }
      delta = fromState ? state.position - fromState.position : 0;
    } else {
      replace(to);
    }
    listeners.forEach((listener) => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
      });
    });
  };
  function pauseListeners() {
    pauseState = currentLocation.value;
  }
  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index = listeners.indexOf(callback);
      if (index > -1)
        listeners.splice(index, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }
  function beforeUnloadListener() {
    const { history: history2 } = window;
    if (!history2.state)
      return;
    history2.replaceState(assign({}, history2.state, { scroll: computeScrollPosition() }), "");
  }
  function destroy() {
    for (const teardown of teardowns)
      teardown();
    teardowns = [];
    window.removeEventListener("popstate", popStateHandler);
    window.removeEventListener("beforeunload", beforeUnloadListener);
  }
  window.addEventListener("popstate", popStateHandler);
  window.addEventListener("beforeunload", beforeUnloadListener);
  return {
    pauseListeners,
    listen,
    destroy
  };
}
function buildState(back, current, forward, replaced = false, computeScroll = false) {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  };
}
function useHistoryStateNavigation(base) {
  const { history: history2, location: location2 } = window;
  const currentLocation = {
    value: createCurrentLocation(base, location2)
  };
  const historyState = { value: history2.state };
  if (!historyState.value) {
    changeLocation(currentLocation.value, {
      back: null,
      current: currentLocation.value,
      forward: null,
      // the length is off by one, we need to decrease it
      position: history2.length - 1,
      replaced: true,
      // don't add a scroll as the user may have an anchor, and we want
      // scrollBehavior to be triggered without a saved position
      scroll: null
    }, true);
  }
  function changeLocation(to, state, replace2) {
    const hashIndex = base.indexOf("#");
    const url = hashIndex > -1 ? (location2.host && document.querySelector("base") ? base : base.slice(hashIndex)) + to : createBaseLocation() + base + to;
    try {
      history2[replace2 ? "replaceState" : "pushState"](state, "", url);
      historyState.value = state;
    } catch (err) {
      {
        console.error(err);
      }
      location2[replace2 ? "replace" : "assign"](url);
    }
  }
  function replace(to, data) {
    const state = assign({}, history2.state, buildState(
      historyState.value.back,
      // keep back and forward entries but override current position
      to,
      historyState.value.forward,
      true
    ), data, { position: historyState.value.position });
    changeLocation(to, state, true);
    currentLocation.value = to;
  }
  function push(to, data) {
    const currentState = assign(
      {},
      // use current history state to gracefully handle a wrong call to
      // history.replaceState
      // https://github.com/vuejs/router/issues/366
      historyState.value,
      history2.state,
      {
        forward: to,
        scroll: computeScrollPosition()
      }
    );
    changeLocation(currentState.current, currentState, true);
    const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
    changeLocation(to, state, false);
    currentLocation.value = to;
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  };
}
function createWebHistory(base) {
  base = normalizeBase(base);
  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
  function go(delta, triggerListeners = true) {
    if (!triggerListeners)
      historyListeners.pauseListeners();
    history.go(delta);
  }
  const routerHistory = assign({
    // it's overridden right after
    location: "",
    base,
    go,
    createHref: createHref.bind(null, base)
  }, historyNavigation, historyListeners);
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: () => historyNavigation.location.value
  });
  Object.defineProperty(routerHistory, "state", {
    enumerable: true,
    get: () => historyNavigation.state.value
  });
  return routerHistory;
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
const NavigationFailureSymbol = Symbol("");
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
function createRouterError(type, params) {
  {
    return assign(new Error(), {
      type,
      [NavigationFailureSymbol]: true
    }, params);
  }
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options2 = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options2.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [
      90
      /* PathScore.Root */
    ];
    if (options2.strict && !segment.length)
      pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = 40 + (options2.sensitive ? 0.25 : 0);
      if (token.type === 0) {
        if (!tokenIndex)
          pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += 40;
      } else if (token.type === 1) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re2 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re2 !== BASE_PARAM_PATTERN) {
          subSegmentScore += 10;
          try {
            new RegExp(`(${re2})`);
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re2}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re2})(?:/(?:${re2}))*)` : `(${re2})`;
        if (!tokenIndex)
          subPattern = // avoid an optional / if there are more segments e.g. /:p?-static
          // or /:p?-:p2
          optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional)
          subPattern += "?";
        pattern += subPattern;
        subSegmentScore += 20;
        if (optional)
          subSegmentScore += -8;
        if (repeatable)
          subSegmentScore += -20;
        if (re2 === ".*")
          subSegmentScore += -50;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options2.strict && options2.end) {
    const i = score.length - 1;
    score[i][score[i].length - 1] += 0.7000000000000001;
  }
  if (!options2.strict)
    pattern += "/?";
  if (options2.end)
    pattern += "$";
  else if (options2.strict)
    pattern += "(?:/|$)";
  const re = new RegExp(pattern, options2.sensitive ? "" : "i");
  function parse(path) {
    const match = path.match(re);
    const params = {};
    if (!match)
      return null;
    for (let i = 1; i < match.length; i++) {
      const value = match[i] || "";
      const key = keys[i - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/"))
        path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) {
        if (token.type === 0) {
          path += token.value;
        } else if (token.type === 1) {
          const { value, repeatable, optional } = token;
          const param = value in params ? params[value] : "";
          if (isArray(param) && !repeatable) {
            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
          }
          const text = isArray(param) ? param.join("/") : param;
          if (!text) {
            if (optional) {
              if (segment.length < 2) {
                if (path.endsWith("/"))
                  path = path.slice(0, -1);
                else
                  avoidDuplicatedSlash = true;
              }
            } else
              throw new Error(`Missing required param "${value}"`);
          }
          path += text;
        }
      }
    }
    return path || "/";
  }
  return {
    re,
    score,
    keys,
    parse,
    stringify
  };
}
function compareScoreArray(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i];
    if (diff)
      return diff;
    i++;
  }
  if (a.length < b.length) {
    return a.length === 1 && a[0] === 40 + 40 ? -1 : 1;
  } else if (a.length > b.length) {
    return b.length === 1 && b[0] === 40 + 40 ? 1 : -1;
  }
  return 0;
}
function comparePathParserScore(a, b) {
  let i = 0;
  const aScore = a.score;
  const bScore = b.score;
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i]);
    if (comp)
      return comp;
    i++;
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore))
      return 1;
    if (isLastScoreNegative(bScore))
      return -1;
  }
  return bScore.length - aScore.length;
}
function isLastScoreNegative(score) {
  const last = score[score.length - 1];
  return score.length > 0 && last[last.length - 1] < 0;
}
const ROOT_TOKEN = {
  type: 0,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path)
    return [[]];
  if (path === "/")
    return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) {
    throw new Error(`Invalid path "${path}"`);
  }
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }
  let state = 0;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment)
      tokens.push(segment);
    segment = [];
  }
  let i = 0;
  let char;
  let buffer = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer)
      return;
    if (state === 0) {
      segment.push({
        type: 0,
        value: buffer
      });
    } else if (state === 1 || state === 2 || state === 3) {
      if (segment.length > 1 && (char === "*" || char === "+"))
        crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 1,
        value: buffer,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else {
      crash("Invalid state to consume buffer");
    }
    buffer = "";
  }
  function addCharToBuffer() {
    buffer += char;
  }
  while (i < path.length) {
    char = path[i++];
    if (char === "\\" && state !== 2) {
      previousState = state;
      state = 4;
      continue;
    }
    switch (state) {
      case 0:
        if (char === "/") {
          if (buffer) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = 1;
        } else {
          addCharToBuffer();
        }
        break;
      case 4:
        addCharToBuffer();
        state = previousState;
        break;
      case 1:
        if (char === "(") {
          state = 2;
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i--;
        }
        break;
      case 2:
        if (char === ")") {
          if (customRe[customRe.length - 1] == "\\")
            customRe = customRe.slice(0, -1) + char;
          else
            state = 3;
        } else {
          customRe += char;
        }
        break;
      case 3:
        consumeBuffer();
        state = 0;
        if (char !== "*" && char !== "?" && char !== "+")
          i--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === 2)
    crash(`Unfinished custom RegExp for param "${buffer}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
function createRouteRecordMatcher(record, parent, options2) {
  const parser = tokensToParser(tokenizePath(record.path), options2);
  const matcher = assign(parser, {
    record,
    parent,
    // these needs to be populated by the parent
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options2 = mergeOptions(globalOptions, record);
    const normalizedRecords = [
      mainNormalizedRecord
    ];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) {
        normalizedRecords.push(assign({}, mainNormalizedRecord, {
          // this allows us to hold a copy of the `components` option
          // so that async components cache is hold on the original record
          components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
          path: alias,
          // we might be the child of an alias
          aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
          // the aliases are always of the same kind as the original since they
          // are defined on the same record
        }));
      }
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options2);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher)
          originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher))
          removeRoute(record.name);
      }
      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;
        for (let i = 0; i < children.length; i++) {
          addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
        }
      }
      originalRecord = originalRecord || matcher;
      if (matcher.record.components && Object.keys(matcher.record.components).length || matcher.record.name || matcher.record.redirect) {
        insertMatcher(matcher);
      }
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name)
          matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    let i = 0;
    while (i < matchers.length && comparePathParserScore(matcher, matchers[i]) >= 0 && // Adding children with empty path should still appear before the parent
    // https://github.com/vuejs/router/issues/1124
    (matcher.record.path !== matchers[i].record.path || !isRecordChildOf(matcher, matchers[i])))
      i++;
    matchers.splice(i, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher))
      matcherMap.set(matcher.record.name, matcher);
  }
  function resolve(location2, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location2 && location2.name) {
      matcher = matcherMap.get(location2.name);
      if (!matcher)
        throw createRouterError(1, {
          location: location2
        });
      name = matcher.record.name;
      params = assign(
        // paramsFromLocation is a new object
        paramsFromLocation(
          currentLocation.params,
          // only keep params that exist in the resolved location
          // TODO: only keep optional params coming from a parent record
          matcher.keys.filter((k) => !k.optional).map((k) => k.name)
        ),
        // discard any existing params in the current location that do not exist here
        // #1497 this ensures better active/exact matching
        location2.params && paramsFromLocation(location2.params, matcher.keys.map((k) => k.name))
      );
      path = matcher.stringify(params);
    } else if ("path" in location2) {
      path = location2.path;
      matcher = matchers.find((m) => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
      if (!matcher)
        throw createRouterError(1, {
          location: location2,
          currentLocation
        });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location2.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes.forEach((route) => addRoute(route));
  return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher };
}
function paramsFromLocation(params, keys) {
  const newParams = {};
  for (const key of keys) {
    if (key in params)
      newParams[key] = params[key];
  }
  return newParams;
}
function normalizeRouteRecord(record) {
  return {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: void 0,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    components: "components" in record ? record.components || null : record.component && { default: record.component }
  };
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) {
    propsObject.default = props;
  } else {
    for (const name in record.components)
      propsObject[name] = typeof props === "boolean" ? props : props[name];
  }
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf)
      return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function mergeOptions(defaults, partialOptions) {
  const options2 = {};
  for (const key in defaults) {
    options2[key] = key in partialOptions ? partialOptions[key] : defaults[key];
  }
  return options2;
}
function isRecordChildOf(record, parent) {
  return parent.children.some((child) => child === record || isRecordChildOf(record, child));
}
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return text == null ? "" : encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?")
    return query;
  const hasLeadingIM = search[0] === "?";
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
  for (let i = 0; i < searchParams.length; ++i) {
    const searchParam = searchParams[i].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!isArray(currentValue)) {
        currentValue = query[key] = [currentValue];
      }
      currentValue.push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) {
        search += (search.length ? "&" : "") + key;
      }
      continue;
    }
    const values = isArray(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)];
    values.forEach((value2) => {
      if (value2 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value2 != null)
          search += "=" + value2;
      }
    });
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) {
      normalizedQuery[key] = isArray(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
    }
  }
  return normalizedQuery;
}
const matchedRouteKey = Symbol("");
const viewDepthKey = Symbol("");
const routerKey = Symbol("");
const routeLocationKey = Symbol("");
const routerViewLocationKey = Symbol("");
function useCallbacks() {
  let handlers = [];
  function add(handler) {
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1)
        handlers.splice(i, 1);
    };
  }
  function reset() {
    handlers = [];
  }
  return {
    add,
    list: () => handlers,
    reset
  };
}
function guardToPromiseFn(guard, to, from, record, name) {
  const enterCallbackArray = record && // name is defined if record is because of the function overload
  (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve, reject) => {
    const next = (valid) => {
      if (valid === false) {
        reject(createRouterError(4, {
          from,
          to
        }));
      } else if (valid instanceof Error) {
        reject(valid);
      } else if (isRouteLocation(valid)) {
        reject(createRouterError(2, {
          from: to,
          to: valid
        }));
      } else {
        if (enterCallbackArray && // since enterCallbackArray is truthy, both record and name also are
        record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") {
          enterCallbackArray.push(valid);
        }
        resolve();
      }
    };
    const guardReturn = guard.call(record && record.instances[name], to, from, next);
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3)
      guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
function extractComponentsGuards(matched, guardType, to, from) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name])
        continue;
      if (isRouteComponent(rawComponent)) {
        const options2 = rawComponent.__vccOpts || rawComponent;
        const guard = options2[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved)
            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.components[name] = resolvedComponent;
          const options2 = resolvedComponent.__vccOpts || resolvedComponent;
          const guard = options2[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name)();
        }));
      }
    }
  }
  return guards;
}
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function useLink(props) {
  const router = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => router.resolve(unref(props.to)));
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length)
      return -1;
    const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1)
      return index;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return (
      // we are dealing with nested routes
      length > 1 && // if the parent and matched route have the same path, this link is
      // referring to the empty child. Or we currently are on a different
      // child of the same parent
      getOriginalPath(routeMatched) === parentRecordPath && // avoid comparing the child with its parent
      currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index
    );
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e = {}) {
    if (guardEvent(e)) {
      return router[unref(props.replace) ? "replace" : "push"](
        unref(props.to)
        // avoid uncaught errors are they are logged anyway
      ).catch(noop);
    }
    return Promise.resolve();
  }
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    // inactiveClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options: options2 } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options2.linkActiveClass, "router-link-active")]: link.isActive,
      // [getLinkClass(
      //   props.inactiveClass,
      //   options.linkInactiveClass,
      //   'router-link-inactive'
      // )]: !link.isExactActive,
      [getLinkClass(props.exactActiveClass, options2.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && slots.default(link);
      return props.custom ? children : h("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        // this would override user added attrs but Vue will still add
        // the listener, so we end up triggering both
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
    return;
  if (e.defaultPrevented)
    return;
  if (e.button !== void 0 && e.button !== 0)
    return;
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target))
      return;
  }
  if (e.preventDefault)
    e.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue)
        return false;
    } else {
      if (!isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i]))
        return false;
    }
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  // #674 we manually inherit them
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  // Better compat for @vue/compat users
  // https://github.com/vuejs/router/issues/1315
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;
      let matchedRoute;
      while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) {
        initialDepth++;
      }
      return initialDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
    provide(viewDepthKey, computed(() => depth.value + 1));
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = ref();
    watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && from !== to && instance && instance === oldInstance) {
          if (!to.leaveGuards.size) {
            to.leaveGuards = from.leaveGuards;
          }
          if (!to.updateGuards.size) {
            to.updateGuards = from.updateGuards;
          }
        }
      }
      if (instance && to && // if there is no instance but to and from are the same this might be
      // the first visit
      (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
        (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
      }
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[currentName];
      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route });
      }
      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };
      const component = h(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return (
        // pass the vnode to the slot as a prop.
        // h and <component :is="..."> both accept vnodes
        normalizeSlot(slots.default, { Component: component, route }) || component
      );
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot)
    return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
const RouterView = RouterViewImpl;
function createRouter(options2) {
  const matcher = createRouterMatcher(options2.routes, options2);
  const parseQuery$1 = options2.parseQuery || parseQuery;
  const stringifyQuery$1 = options2.stringifyQuery || stringifyQuery;
  const routerHistory = options2.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options2.scrollBehavior && "scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = (
    // @ts-expect-error: intentionally avoid the type check
    applyToParams.bind(null, decode)
  );
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    }
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute2 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href2 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute2, {
        params: decodeParams(matchedRoute2.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href2
      });
    }
    let matcherLocation;
    if ("path" in rawLocation) {
      matcherLocation = assign({}, rawLocation, {
        path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
      });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = assign({}, rawLocation, {
        params: encodeParams(rawLocation.params)
      });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      // keep the hash encoded so fullPath is effectively path + encodedQuery +
      // hash
      hash,
      query: (
        // if the user is using a custom query lib like qs, we might have
        // nested objects, so we keep the query as is, meaning it can contain
        // numbers at `$route.query`, but at the point, the user will have to
        // use their own type anyway.
        // https://github.com/vuejs/router/issues/328#issuecomment-649481567
        stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
      )
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to) {
    return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
  }
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) {
      return createRouterError(8, {
        from,
        to
      });
    }
  }
  function push(to) {
    return pushWithRedirect(to);
  }
  function replace(to) {
    return push(assign(locationAsObject(to), { replace: true }));
  }
  function handleRedirectRecord(to) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : (
          // force empty params
          { path: newTargetLocation }
        );
        newTargetLocation.params = {};
      }
      return assign({
        query: to.query,
        hash: to.hash,
        // avoid transferring params if the redirect has a path
        params: "path" in newTargetLocation ? {} : to.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace2 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation);
    if (shouldRedirect)
      return pushWithRedirect(
        assign(locationAsObject(shouldRedirect), {
          state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
          force,
          replace: replace2
        }),
        // keep original redirectedFrom if it exists
        redirectedFrom || targetLocation
      );
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(16, { to: toLocation, from });
      handleScroll(
        from,
        from,
        // this is a push, the only way for it to be triggered from a
        // history.listen is with a redirect, which makes it become a push
        true,
        // This cannot be the first navigation because the initial location
        // cannot be manually navigated to
        false
      );
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? (
      // navigation redirects still mark the router as ready
      isNavigationFailure(
        error,
        2
        /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
      ) ? error : markAsReady(error)
    ) : (
      // reject any unknown error
      triggerError(error, toLocation, from)
    )).then((failure2) => {
      if (failure2) {
        if (isNavigationFailure(
          failure2,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          return pushWithRedirect(
            // keep options
            assign({
              // preserve an existing replacement but allow the redirect to override it
              replace: replace2
            }, locationAsObject(failure2.to), {
              state: typeof failure2.to === "object" ? assign({}, data, failure2.to.state) : data,
              force
            }),
            // preserve the original redirectedFrom if any
            redirectedFrom || toLocation
          );
        }
      } else {
        failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
      }
      triggerAfterEach(toLocation, from, failure2);
      return failure2;
    });
  }
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) {
      record.leaveGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
    }
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) {
        record.updateGuards.forEach((guard) => {
          guards.push(guardToPromiseFn(guard, to, from));
        });
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of to.matched) {
        if (record.beforeEnter && !from.matched.includes(record)) {
          if (isArray(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to, from));
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to, from));
          }
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(
      err,
      8
      /* ErrorTypes.NAVIGATION_CANCELLED */
    ) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to, from, failure) {
    for (const guard of afterGuards.list())
      guard(to, from, failure);
  }
  function finalizeNavigation(toLocation, from, isPush, replace2, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error)
      return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) {
      if (replace2 || isFirstNavigation)
        routerHistory.replace(toLocation.fullPath, assign({
          scroll: isFirstNavigation && state && state.scroll
        }, data));
      else
        routerHistory.push(toLocation.fullPath, data);
    }
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener)
      return;
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      if (!router.listening)
        return;
      const toLocation = resolve(to);
      const shouldRedirect = handleRedirectRecord(toLocation);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) {
        saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      }
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(
          error,
          4 | 8
          /* ErrorTypes.NAVIGATION_CANCELLED */
        )) {
          return error;
        }
        if (isNavigationFailure(
          error,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          pushWithRedirect(
            error.to,
            toLocation
            // avoid an uncaught rejection, let push call triggerError
          ).then((failure) => {
            if (isNavigationFailure(
              failure,
              4 | 16
              /* ErrorTypes.NAVIGATION_DUPLICATED */
            ) && !info.delta && info.type === NavigationType.pop) {
              routerHistory.go(-1, false);
            }
          }).catch(noop);
          return Promise.reject();
        }
        if (info.delta) {
          routerHistory.go(-info.delta, false);
        }
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(
          // after navigation, all matched components are resolved
          toLocation,
          from,
          false
        );
        if (failure) {
          if (info.delta && // a new navigation has been triggered, so we do not want to revert, that will change the current history
          // entry while a different route is displayed
          !isNavigationFailure(
            failure,
            8
            /* ErrorTypes.NAVIGATION_CANCELLED */
          )) {
            routerHistory.go(-info.delta, false);
          } else if (info.type === NavigationType.pop && isNavigationFailure(
            failure,
            4 | 16
            /* ErrorTypes.NAVIGATION_DUPLICATED */
          )) {
            routerHistory.go(-1, false);
          }
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop);
    });
  }
  let readyHandlers = useCallbacks();
  let errorHandlers = useCallbacks();
  let ready;
  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorHandlers.list();
    if (list.length) {
      list.forEach((handler) => handler(error, to, from));
    } else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve2, reject) => {
      readyHandlers.add([resolve2, reject]);
    });
  }
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve2, reject]) => err ? reject(err) : resolve2());
      readyHandlers.reset();
    }
    return err;
  }
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options2;
    if (!isBrowser || !scrollBehavior)
      return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
  }
  const go = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
    options: options2,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorHandlers.add,
    isReady,
    install(app) {
      const router2 = this;
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);
      app.config.globalProperties.$router = router2;
      Object.defineProperty(app.config.globalProperties, "$route", {
        enumerable: true,
        get: () => unref(currentRoute)
      });
      if (isBrowser && // used for the initial navigation client side to avoid pushing
      // multiple times when the router is used in multiple apps
      !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) {
        reactiveRoute[key] = computed(() => currentRoute.value[key]);
      }
      app.provide(routerKey, router2);
      app.provide(routeLocationKey, reactive(reactiveRoute));
      app.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app.unmount;
      installedApps.add(app);
      app.unmount = function() {
        installedApps.delete(app);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  return router;
}
function runGuardQueue(guards) {
  return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to.matched.length);
  for (let i = 0; i < len; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) {
      if (to.matched.find((record) => isSameRouteRecord(record, recordFrom)))
        updatingRecords.push(recordFrom);
      else
        leavingRecords.push(recordFrom);
    }
    const recordTo = to.matched[i];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) {
        enteringRecords.push(recordTo);
      }
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords];
}
async function main() {
  const app = createApp(_sfc_main);
  const pinia = createPinia();
  const router = createRouter({
    history: createWebHistory(),
    routes: [{
      path: "/",
      name: "Home",
      component: () => __vitePreload(() => import("./Home-J0trjPys.js"), true ? __vite__mapDeps([0,1]) : void 0)
      // meta: {
      //     collections: {
      //         items: document => ({
      //             query: {
      //                 'data.meta.layout': 'Home',
      //                 'data.meta.lang': document.meta.lang
      //             }
      //         }),
      //     }
      // }
    }, {
      path: "/projects",
      name: "Projects",
      component: () => __vitePreload(() => import("./Projects-ZhyImSum.js"), true ? __vite__mapDeps([2,1]) : void 0)
      // meta: {
      //     collections: {
      //         items: document => ({
      //             'data.meta.layout': 'Project',
      //             'data.meta.lang': document.meta.lang
      //         }),
      //     }
      // },
    }]
  });
  const mikser = await createMikser({
    router,
    store: pinia,
    dataSource: new MikserDataSource({ baseUrl: "https://gpoint.bg" }),
    options: {
      domain: "gpoint.bg",
      // "gtag": "G-JPF7CWHSXQ",
      // "fbq": "616081495752346",        
      // context: WHITEBOX_CONTEXT,
      shared: true
    }
  });
  app.use(pinia);
  app.use(router);
  app.use(mikser);
  app.mount("#app");
}
main();
