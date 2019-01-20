'use strict'

// TODO: This file needs a lot of cleaning up.
// Settings
var compactApprovals = true
var authorEnabled = true

/**
 * Scrapes the project id from the page.
 * @returns the GitLab project id of the currently viewed repo.
 */
function getProjectId () {
  return $('[name="project_id"]').val()
}

/**
 * Scrapes the group id from the page.
 * @returns the GitLab group id of the currently viewed group view.
 */
function getGroupId () {
  return $('[name="group_id"]').val()
}

/**
 * Scrapes through and gets the ids of the Merge Requests that are currently visible on the page.
 * @param {Integer} projectId the project id.
 */
function parseMergeRequestsOnPage (projectId) {
  $('li.merge-request').each(function (index) {
    // Parse out the Merge Request Iid (used for getting appr)
    let requestView = this
    var ref = $(requestView).find('.merge-request-title-text a:first').attr('href').split('/')
    var requestIid = ref[ref.length - 1]
    if (isNaN(projectId)) {
      let projectName = $(requestView).find('.merge-request-title-text a:first').attr('href').split('/merge_requests/')[0].substring(1)
      getCachedProjectId(projectName, function (projectIdd) {
        getCachedMergeRequest(`${projectIdd}:${requestIid}`, function (cachedResult) {
          let checkDate = new Date(cachedResult.updated_at) < new Date($(requestView).find('.issuable-updated-at').find('time').attr('datetime'))
          if (checkDate) {
            onCacheEntryChecked(projectIdd, requestIid)
          } else {
            onCacheEntryChecked(projectIdd, requestIid, cachedResult)
          }
        })
      })
    } else {
      getCachedMergeRequest(`${projectId}:${requestIid}`, function (cachedResult) {
        let checkDate = new Date(cachedResult.updated_at) < new Date($(requestView).find('.issuable-updated-at').find('time').attr('datetime'))
        if (checkDate) {
          onCacheEntryChecked(projectId, requestIid)
        } else {
          onCacheEntryChecked(projectId, requestIid, cachedResult)
        }
      })
    }
  })
}

/**
 * Determines whether to fetch and cache a new MR data point or inject a cache entry.
 * @param {Integer} projectId the project id.
 * @param {Integer} requestIid the merge request iid.
 * @param {Object.MergeRequest} cachedMergeRequest a cached merge request approval data set. Could be undefined if no cache entry exists.
 */
function onCacheEntryChecked (projectId, requestIid, cachedMergeRequest) {
  let mergeRequestView = $(`a[href*="/merge_requests/${requestIid}"`).parents('li.merge-request')
  if (isNaN(cachedMergeRequest) || isNaN(cachedMergeRequest.iid)) {
    // console.log(`Create new cached entry (MR IID: ${requestIid})`)
    parseApprovals(projectId, requestIid, mergeRequestView)
  } else {
    // console.log(`Using cached entry (MR IID: ${requestIid})`)
    handleMergeRequestApprovalInjection(requestIid, cachedMergeRequest, mergeRequestView)
  }
}

/**
 * Makes a request to fetch the approval list for a given Merge Request then proceeds to inject
 * the list of approvals into the respective Merge Request row.
 * @param {Integer} mergeRequestId the id of a given Merge Request in GitLab.
 * @param {Element} requestView the HTML element reference to the Merge Request row.
 */
function parseApprovals (projectId, mergeRequestId, requestView) {
  getApprovals(projectId, mergeRequestId)
    .then(mergeRequest => {
      cacheMergeRequest(`${projectId}:${mergeRequestId}`, mergeRequest)
      handleMergeRequestApprovalInjection(mergeRequestId, mergeRequest, requestView)
    })
}

/**
 * Handles the injection of approvals for MRs.
 * @param {Integer} mergeRequestId the iid of the mr.
 * @param {Object.MergeRequest} mergeRequest the merge request data to inject.
 * @param {Element} requestView the view to inject the data into.
 */
function handleMergeRequestApprovalInjection (mergeRequestId, mergeRequest, requestView) {
  // Add the larger author div
  if (authorEnabled) {
    injectAuthorView(requestView)
  }

  // Add the approval divs
  if (compactApprovals) {
    injectApprovalListCompact(requestView, mergeRequest.approvals_left, mergeRequest.approved_by)
  } else {
    injectApprovalList(requestView, mergeRequest.approvals_left, mergeRequest.approved_by)
  }
}

/**
 * Injects a simliar approval list that is found within an Merge Request page.
 * @param {Element} requestView the HTML element reference to the Merge Request row.
 * @param {Integer} requiredApprovalsLeft the number of approvals left to allow for a merge.
 * @param {List<GitLab.User>} approvalUsers the users that have approved this Merge Request.
 */
function injectApprovalList (requestView, requiredApprovalsLeft, approvalUsers) {
  // Create the initial divs that wrap the approvals -- similar to the one found when viewing the MR
  let listContainer = `<div class="approved-by-users approvals-footer clearfix mr-info-list"><div class="approvers-prefix"><p>Approved by</p><div class="approvers-list">`
  approvalUsers.forEach(entry => {
    listContainer += createApprovalDiv(entry.user)
  })

  // Insert required approval slots (if any are needed)
  for (let i = 0; i < requiredApprovalsLeft; i++) {
    listContainer += createRequiredApprovalDiv()
  }

  // Close the container
  listContainer += `</div></div></div>`

  // Inject the list
  $(requestView)
    .find('.issue-main-info')
    .append(listContainer)
}

/**
 * Injects a simliar approval list that is found within an Merge Request page (except in a more compact way)
 * @param {Element} requestView the HTML element reference to the Merge Request row.
 * @param {Integer} requiredApprovalsLeft the number of approvals left to allow for a merge.
 * @param {List<GitLab.User>} approvalUsers the users that have approved this Merge Request.
 */
function injectApprovalListCompact (requestView, requiredApprovalsLeft, approvalUsers) {
  // Create the initial divs that wrap the approvals -- similar to the one found when viewing the MR
  let listContainer = `<div class="approved-by-users approvals-footer"><div class="approvers-prefix"><div class="approvers-list">`
  approvalUsers.forEach(entry => {
    listContainer += createApprovalDiv(entry.user)
  })

  // Insert required approval slots (if any are needed)
  for (let i = 0; i < requiredApprovalsLeft; i++) {
    listContainer += createRequiredApprovalDiv()
  }

  // Close the container
  listContainer += `</div></div></div>`

  // Inject the list
  if ($(requestView).find('.issuable-upvotes').length) {
    $(listContainer).insertBefore($(requestView).find('.issuable-upvotes'))
  } else {
    $(listContainer).insertBefore($(requestView).find('.issuable-comments'))
  }
}

/**
 * Moves and enlarges the author image to the left hand side when enabled.
 * @param {Element} requestView the HTML element reference to the Merge Request row.
 */
function injectAuthorView (requestView) {
  // Check for if we're on the updated version of their css
  if ($(requestView).find('a.author_link.has-tooltip').length) {
    $(requestView).find('a.author_link.has-tooltip')
      .find('img')
      .removeClass('s16')
      .addClass('s36')
      .parent()
      .prependTo(requestView)
  } else {
    $(requestView).find('a.author-link.has-tooltip')
      .find('img')
      .removeClass('s16')
      .addClass('s36')
      .parent()
      .prependTo(requestView)
  }
}

/**
 * Generates a div based on the provided user info.
 * @param {Object.User} user an user approval object from the GitLab API.
 */
function createApprovalDiv (user) {
  return `
  <div class='link-to-member-avatar'>
    <a class="author_link has-tooltip approver-avatar js-approver-list-member" data-container="body" href="/${user.username}" data-original-title="Approved by ${user.name}">
      <img width="20" class="avatar avatar-inline s20 js-lazy-loaded" alt="" src="${user.avatar_url}">
    </a>
  </div>`
}

/**
 * Generates a div with the empty SVG icon used for missing required approvals.
 */
function createRequiredApprovalDiv () {
  return `
  <div class='link-to-member-avatar'>
    <a href="" data-container="body" class="author_link disabled">
      <span width="20" class="s20 avatar avatar-inline avatar-placeholder" style="margin-left: 0px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 27">
          <path fill="#bfbfbf" fill-rule="evenodd" d="m13.5 26.5c1.412 0 2.794-.225 4.107-.662l-.316-.949c-1.212.403-2.487.611-3.792.611v1m6.06-1.495c1.234-.651 2.355-1.498 3.321-2.504l-.721-.692c-.892.929-1.928 1.711-3.067 2.312l.467.884m4.66-4.147c.79-1.149 1.391-2.418 1.777-3.762l-.961-.276c-.356 1.24-.911 2.411-1.64 3.471l.824.567m2.184-5.761c.063-.518.096-1.041.097-1.568 0-.896-.085-1.758-.255-2.603l-.98.197c.157.78.236 1.576.236 2.405-.001.486-.031.97-.09 1.448l.993.122m-.738-6.189c-.493-1.307-1.195-2.523-2.075-3.605l-.776.631c.812.999 1.46 2.122 1.916 3.327l.935-.353m-3.539-5.133c-1.043-.926-2.229-1.68-3.512-2.229l-.394.919c1.184.507 2.279 1.203 3.242 2.058l.664-.748m-5.463-2.886c-1.012-.253-2.058-.384-3.119-.388-.378 0-.717.013-1.059.039l.077.997c.316-.024.629-.036.98-.036.979.003 1.944.124 2.879.358l.243-.97m-6.238-.022c-1.361.33-2.653.878-3.832 1.619l.532.847c1.089-.684 2.281-1.189 3.536-1.494l-.236-.972m-5.517 2.878c-1.047.922-1.94 2.01-2.643 3.212l.864.504c.649-1.112 1.474-2.114 2.441-2.966l-.661-.75m-3.54 5.076c-.499 1.293-.789 2.664-.854 4.072l.999.046c.06-1.3.328-2.564.788-3.758l-.933-.36m-.78 6.202c.163 1.396.549 2.744 1.14 4l.905-.425c-.545-1.16-.902-2.404-1.052-3.692l-.993.116m2.177 5.814c.788 1.151 1.756 2.169 2.866 3.01l.606-.796c-1.025-.78-1.919-1.721-2.646-2.783l-.825.565m4.665 4.164c1.23.65 2.559 1.1 3.943 1.328l.162-.987c-1.278-.21-2.503-.625-3.638-1.225l-.468.884m6.02 1.501c.024 0 .024 0 .048 0v-1c-.022 0-.022 0-.044 0l-.004 1"></path>
        </svg>
      </span>
    </a>
  </div>`
}

/*
 * Loads up the settings, and then begins pulling in the merge request approval info.
 */
function getSettingsAndStart () {
  chrome.storage.local.get(null, settings => {
    if (!isNaN(settings['compact-approval'])) {
      compactApprovals = settings['compact-approval']
    }
    if (!isNaN(settings['author'])) {
      authorEnabled = settings['author']
    }

    // Begin parsing and injecting views
    if (window.location.href.indexOf('merge_requests') !== -1) {
      if (window.location.href.indexOf('groups') !== -1) {
        // Get all merge requests for a group view
        if (checkForNewProjects(settings)) {
          getGroupProjectIds(getGroupId())
            .then(groupInformation => {
              groupInformation.projects.forEach(project => {
                if (!(project.path_with_namespace in settings)) {
                  cacheProjectId(project.path_with_namespace, project.id)
                }
              })
            }).then(() => {
              parseMergeRequestsOnPage(null)
            })
        } else {
          // No need to fetch; we have all the required project ids
          parseMergeRequestsOnPage(null)
        }
      } else if (window.location.href.indexOf('new') !== -1) {
        // Auto-check remove branch checkbox if setting is enabled
        if (!isNaN(settings['auto-select-force-remove'])) {
          $('#merge_request_force_remove_source_branch').prop('checked', settings['auto-select-force-remove'])
        }
      } else {
        // Get all merge requests for a project view
        parseMergeRequestsOnPage(getProjectId())
      }
    }
  })
}

/**
 * Checks for new projects that are in the group view.
 * @param {Object} storage chrome storage object. (Just a map of values)
 * @return true if a new project was found; false otherwise.
 */
function checkForNewProjects (storage) {
  var newProjectFound = false
  $('li.merge-request').each(function (index) {
    let projectName = $(this).find('.merge-request-title-text a:first').attr('href')
      .split('/merge_requests/')[0]
      .substring(1)

    // Check if we have a project id
    if (!(projectName in storage)) {
      newProjectFound = true
    }
  })
  return newProjectFound
}

// Begin running
getSettingsAndStart()
