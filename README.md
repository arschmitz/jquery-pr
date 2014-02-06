jquery-pr
=================

an extension for chrome to check jquery foundation PR's for cla/caa signatures, commit message format and line lengths

Usage
-----------------

To use, go to any PR on github and click the PR button in your browser bar. A window will popup and run
tests and display results of each.

**NOTE: You must be signed into google to use the cla/caa check because chrome extensions can only**
**use external scripts loaded via https which requires authentication.**

Options
-----------------

You can access the options page via the chrome extensions page. Under jquery-pr just click
options at the bottom

There are currently two configurable options

#### **Check commit message format**:

determines if the commit message format should be checked

#### **Check line lengths**:

Checks each line modified in a js file to ensure that it's under 100 chars

Installation
-----------------

To install the extension and use it, you can download the latest stable packed version from
http://uglymongrel.com/download/jquery-pr.crx ( you must right click and save file )

Once downloaded, simply drag onto the extensions page in chrome settings.

alternatively to use git pull to do updates just install as instructed below for development 

Development
-----------------

This extension is just simple js css and html. To instal the extension for development

1.) Clone this repo

2.) Go to the settings page in chrome and go to the extensions section.

3.) check the developer mode checkbox

4.) click load unpacked extension and select the folder for jquery-pr repo

changes to js, css, html files will show as soon as the file is saved
changes to images or manifest will require the extension to be reloaded
to test a packed version, simply click pack extension and select the jquery-pr folder
