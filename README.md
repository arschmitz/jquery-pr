jquery-pr
=================

an extension for chrome to check jquery foundation PR's for cla/caa signitures commit message format and line lengths

Usage
-----------------

To use go to any PR on github and click the PR button in your browser bar a window will popup and run
tests and display results of each.

**NOTE: You must be signed into google to use the cla/caa check because chrome extensions can only**
**use external scripts loaded via https which requires authentication.**

Options
-----------------

You can access the options page via the chrome extensions page under jquery-pr just click
options at the bottom

There are currently two configureable options

#### **Check commit message format**:

determins if the commit message format should be checked

#### **Check line lengths**:

Check each line modified in a js file to ensure its under 100chars

Instalation
-----------------

to install the extension and use it you can download the latest stable packed version from
http://uglymongrel.com/download/jquery-pr.crx ( you must right click and save file )

once downloaded simply drag onto the extensions page in chrome settings.

Development
-----------------

This extension is just simple js css and html to instal the extension for development

1.) Go to the setting page in chrome and go to the extensions section.

2.) check the developer mode checkbox

3.) click load unpacked extension and select the folder for jquery-pr

changes to js,css,html files will show as soon as the files is saved
changes to images or manifest will require the extension to be reloaded
to test a packed version simply click pack extension and select the jquery-pr folder
