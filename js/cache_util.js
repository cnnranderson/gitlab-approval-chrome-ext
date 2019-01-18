'use strict'

function getCacheMarks (callback) {
  chrome.storage.local.get(['cache-marks'], callback)
}

function setCacheMarks (cacheRefIds) {
  chrome.storage.local.set({ 'cache-marks': cacheRefIds }, function () {
    console.log(`Cached mr iids: ${cacheRefIds}`)
  })
}

/**
 * d.
 * @param {Integer} mergeRequestIid d.
 */
function getCachedMergeRequest (cacheRefId, callback) {
  chrome.storage.local.get(cacheRefId, function (result) {
    if (typeof result[cacheRefId] !== 'undefined' && result[cacheRefId].iid !== 'undefined') {
      callback(result[cacheRefId])
    } else {
      console.log(`Couldn't find cached entry for ${cacheRefId}`)
      deleteCacheEntry(cacheRefId)
      callback(result)
    }
  })
}

/**
 * d.
 * @param {String} cacheRefId the cache marker that determines the project and merge request reference ("projectId:mergeRequestIid").
 * @param {Object.MergeRequest} mergeRequest d.
 */
function cacheMergeRequest (cacheRefId, mergeRequest) {
  chrome.storage.local.set({ [cacheRefId]: mergeRequest }, function () {
    console.log(`Cached merge request entry: ${cacheRefId}`)
  })
}

/**
 * Purges any stale entries from the cache.
 * @param {Array.Integer} cacheRefIds array of cache reference ids to keep.
 */
function cleanupCache (cacheRefIds) {
  getCacheMarks(function (marks) {
    if (typeof marks !== 'undefined' && marks.length > 0) {
      marks.forEach(function (mark) {
        if (cacheRefIds.indexOf(mark) === -1) {
          deleteCacheEntry(mark)
        }
      })
    }
    setCacheMarks(cacheRefIds)
  })
}

/**
 * Removes a stale cache entry from the cache.
 * @param {String} cacheRefId the cache entry id.
 */
function deleteCacheEntry (cacheRefId) {
  chrome.storage.local.remove([cacheRefId], function () {
    console.log(`Deleted stale cache entry for ${cacheRefId}`)
  })
}
