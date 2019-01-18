'use strict'

var compactApprovalCheckbox = 'input[name=compact-approval]'
var authorCheckbox = 'input[name=author]'

$(compactApprovalCheckbox).change(
  function () {
    chrome.storage.local.set({ 'compact-approval': this.checked }, function () {
      console.log("Saved Compact Preference: " + $(compactApprovalCheckbox).is(":checked"))
      $('#saved-message').removeClass('hidden').addClass('visible').transition('bounce')
      let now = new Date().toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })
      $('#saved-message-body').empty().append(`Setting Saved! (${now})`)
    })
  })

$(authorCheckbox).change(
  function () {
    chrome.storage.local.set({ 'author': this.checked }, function () {
      console.log("Saved Author Visible Preference: " + $(authorCheckbox).is(":checked"))
      $('#saved-message').removeClass('hidden').addClass('visible').transition('bounce')
    })
  })

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
}

function settingExists (setting, returnCallback) {
  chrome.storage.local.get([setting], function (result) {
    returnCallback(typeof result !== 'undefined', result)
  })
}
loadSettings()
