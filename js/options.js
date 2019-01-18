'use strict'

var compactApprovalCheckbox = 'input[name=compact-approval]'
var authorCheckbox = 'input[name=author]'

$(compactApprovalCheckbox).change(
  function () {
    chrome.storage.local.set({ 'compact-approval': this.checked }, function () {
      console.log("Saved Compact Preference: " + $(compactApprovalCheckbox).is(":checked"))
    })
  })

$(authorCheckbox).change(
  function () {
    chrome.storage.local.set({ 'author': this.checked }, function () {
      console.log("Saved Author Visible Preference: " + $(authorCheckbox).is(":checked"))
    })
  })

function loadSettings () {
  var compact = 'compact-approval'
  chrome.storage.local.get([compact], function (result) {
    $(compactApprovalCheckbox).prop('checked', result[compact])
  })
  var author = 'author'
  chrome.storage.local.get([author], function (result) {
    $(authorCheckbox).prop('checked', result[author])
  })
}
loadSettings()
