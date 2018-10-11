'use strict'

const host = 'nordstrom'
const svcHost = `https://gitlab.${host}.com/api/v4`
const projectId = 8793
const HTTP_GET = 'GET'

/**
 * Fetches all approvals for a given Merge Request using its iid via an Xhr request.
 * @param {Integer} mergeRequestId the merge request iid.
 * @returns xhr response.
 */
function getApprovals (mergeRequestId) {
  console.log(`Fetching approvals... (MR iid: ${mergeRequestId})`)
  return makeXhrRequest(
    HTTP_GET,
    `${svcHost}/projects/${projectId}/merge_requests/${mergeRequestId}/approvals/`
  )
}

/**
 * Make a URL request using Xhr.
 * @param {String} method the method type of the request (eg. GET, POST, etc)
 * @param {String} url the url to make a request against.
 * @returns xhr response.
 */
function makeXhrRequest (method, url) {
  return new Promise((resolve, reject) => {
    // Setup the request
    let xhr = new XMLHttpRequest()
    xhr.open(method, url, true)

    // When the function loads
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        return resolve(JSON.parse(xhr.response))
      } else {
        reject(Error({
          status: xhr.status,
          statusTextInElse: xhr.statusText
        }))
      }
    }

    // Error handling
    xhr.onerror = function () {
      reject(Error({
        status: xhr.status,
        statusTextInElse: xhr.statusText
      }))
    }
    xhr.send()
  })
}
