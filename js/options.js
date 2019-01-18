'use strict'

var compactApprovalCheckbox = 'input[name=compact-approval]'
var authorCheckbox = 'input[name=author]'
var autoRemoveCheckbox = 'input[name=auto-select-force-remove]'

$(compactApprovalCheckbox).change(
  function () {
    chrome.storage.local.set({ 'compact-approval': this.checked }, function () {
      updateSavedMessage()
    })
  })

$(authorCheckbox).change(
  function () {
    chrome.storage.local.set({ 'author': this.checked }, function () {
      updateSavedMessage()
    })
  })

$(autoRemoveCheckbox).change(
  function () {
    chrome.storage.local.set({ 'auto-select-force-remove': this.checked }, function () {
      updateSavedMessage()
    })
  })

function updateSavedMessage () {
  $('#saved-message').removeClass('hidden').addClass('visible').transition('bounce')
  let now = new Date().toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })
  $('#saved-message-body').empty().append(`Setting Saved! (${now})`)
}

function loadSettings () {
  var compact = 'compact-approval'
  settingExists(compact, function (exists, value) {
    if (exists) {
      $(compactApprovalCheckbox).prop('checked', value)
    } else {
      $(compactApprovalCheckbox).prop('checked', true)
    }
  })

  var author = 'author'
  settingExists(author, function (exists, value) {
    if (exists) {
      $(authorCheckbox).prop('checked', value)
    } else {
      $(authorCheckbox).prop('checked', true)
    }
  })

  var autoRemove = 'auto-select-force-remove'
  settingExists(autoRemove, function (exists, value) {
    if (exists) {
      $(autoRemoveCheckbox).prop('checked', value)
    } else {
      $(autoRemoveCheckbox).prop('checked', true)
    }
  })
}

function settingExists (setting, returnCallback) {
  chrome.storage.local.get(setting, function (result) {
    returnCallback(typeof result[setting] !== 'undefined', result[setting])
  })
}
loadSettings()
