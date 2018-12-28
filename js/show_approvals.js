'use strict'

// Settings
var compactApprovals = false
var authorEnabled = false

/**
 * Scrapes the project id from the page.
 * @returns the GitLab project id of the currently viewed repo.
 */
function getProjectId () {
  return $('[name="project_id"]').val()
}

/**
 * Scrapes through and gets the ids of the Merge Requests that are currently visible on the page.
 */
function parseMergeRequestsOnPage () {
  console.log('Getting merge request ids')

  // Get the project id
  var projectId = getProjectId()

  // Iterate through all Merge Requests in the list
  $('.merge-request').each(function (index) {
    // Parse out the Merge Request Iid (used for getting appr)
    var ref = $(this).find('.merge-request-title-text a:first').attr('href').split('/')
    var requestId = ref[ref.length - 1]
    parseApprovals(projectId, requestId, this)
  })
}

/**
 * Makes a request to fetch the approval list for a given Merge Request then proceeds to inject
 * the list of approvals into the respective Merge Request row.
 * @param {Integer} mergeRequestId the id of a given Merge Request in GitLab.
 * @param {Element} requestView the HTML element reference to the Merge Request row.
 */
function parseApprovals (projectId, mergeRequestId, requestView) {
  getApprovals(projectId, mergeRequestId)
    .then(function (mergeRequest) {
      if (mergeRequest.approved_by.length === 0) {
        console.log(`No approvals for: ${mergeRequestId}`)
      }

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
    })
}

/**
 * Injects a simliar approval list that is found within an Merge Request page.
 * @param {Element} requestView the HTML element reference to the Merge Request row.
 * @param {Integer} requiredApprovalsLeft the number of approvals left to allow for a merge.
 * @param {List<GitLab.User>} approvalUsers the users that have approved this Merge Request.
 */
function injectApprovalList (requestView, requiredApprovalsLeft, approvalUsers) {
  // Create the initial divs that wrap the approvals -- similar to the one found when viewing the MR
  var listContainer = `<div class="approved-by-users approvals-footer clearfix mr-info-list"><div class="approvers-prefix"><p>Approved by</p><div class="approvers-list">`
  approvalUsers.forEach(entry => {
    listContainer += createApprovalDiv(entry.user)
  })

  // Insert required approval slots (if any are needed)
  var i = 0
  for (i = 0; i < requiredApprovalsLeft; i++) {
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
  var listContainer = `<div class="approved-by-users approvals-footer"><div class="approvers-prefix"><div class="approvers-list">`
  approvalUsers.forEach(entry => {
    listContainer += createApprovalDiv(entry.user)
  })

  // Insert required approval slots (if any are needed)
  var i = 0
  for (i = 0; i < requiredApprovalsLeft; i++) {
    listContainer += createRequiredApprovalDiv()
  }

  // Close the container
  listContainer += `</div></div></div>`

  // Inject the list
  $(listContainer).insertAfter($(requestView).find('.issuable-pipeline-status'))
}

/**
 * Moves and enlarges the author image to the left hand side when enabled.
 * @param {Element} requestView the HTML element reference to the Merge Request row.
 */
function injectAuthorView (requestView) {
  $(requestView).find('a.author_link.has-tooltip')
    .find('img')
    .removeClass('s16')
    .addClass('s36')
    .parent()
    .prependTo(requestView)
}

/**
 * Generates a div based on the provided user info.
 * @param {GitLab.User} user an user approval object from the GitLab API.
 */
function createApprovalDiv (user) {
  return `
  <div class='link-to-member-avatar'>
    <a class="author_link has-tooltip approver-avatar js-approver-list-member" data-container="body" href="/${user.username}" data-original-title="Approved by ${user.name}">
      <img width="20" class="avatar avatar-inline s20 js-lazy-loaded" alt="" 
                      src="${user.avatar_url}">
    </a>
  </div>`
}

function createAuthorDiv () {
  return `<a class="author_link has-tooltip" title="" data-container="body" href="/Toan.Vu" data-original-title="Assigned to Toan Vu"><img
            width="24" class="avatar avatar-inline s42 js-lazy-loaded" alt="" src="/uploads/-/system/user/avatar/1704/avatar.png"></a>`
}

/**
 * Generates a div with the empty SVG icon used for missing required approvals.
 */
function createRequiredApprovalDiv () {
  return `
  <div class='link-to-member-avatar'>
    <a href="" data-container="body" class="author_link disabled">
      <span width="20" height="20" class="s20 avatar avatar-inline avatar-placeholder">
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
  chrome.storage.local.get(null, function (settings) {
    compactApprovals = settings['compact-approval']
    authorEnabled = settings['author']

    // Get all merge requests
    parseMergeRequestsOnPage()
  })
}

// Begin running
getSettingsAndStart()
