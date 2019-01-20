'use strict'

/**
 * Gets a cached merge request.
 * @param {Integer} mergeRequestIid merge request iid.
 * @param {Function} callback where to return the value back to.
 */
function getCachedMergeRequest (cacheRefId, callback) {
  chrome.storage.local.get(cacheRefId, function (result) {
    if (!isNaN(result[cacheRefId]) && !isNaN(result[cacheRefId].iid)) {
      callback(result[cacheRefId])
    } else {
      deleteCacheEntry(cacheRefId)
      callback(result)
    }
  })
}

/**
 * Caches a merge request response.
 * @param {String} cacheRefId the cache marker that determines the project and merge request reference ("projectId:mergeRequestIid").
 * @param {Object.MergeRequest} mergeRequest merge request response object.
 */
function cacheMergeRequest (cacheRefId, mergeRequest) {
  chrome.storage.local.set({ [cacheRefId]: mergeRequest }, () => {
    console.log(`Cached merge request entry: ${cacheRefId}`)
  })
}

/**
 * Removes a stale cache entry from the cache.
 * @param {String} cacheRefId the cache entry id.
 */
function deleteCacheEntry (cacheRefId) {
  chrome.storage.local.remove([cacheRefId], () => {
    console.log(`Deleted stale cache entry for ${cacheRefId}`)
  })
}

function cacheProjectId (projectName, projectId) {
  chrome.storage.local.set({ [projectName]: projectId })
}

function getCachedProjectId (projectName, callback) {
  chrome.storage.local.get([projectName], result => {
    callback(result[projectName])
  })
}

function isNaN (thing) {
  return (typeof thing === 'undefined') || (thing == null)
}
