$(document).ready(() => {
  const $window = $('.window');
  const $terminal = $('#terminal');
  const $toolbar = $window.find('.toolbar');
  const $buttonContainer = $toolbar.find('.button-container');
  const $html = $('html');
  const $a = $('a');

  let desktop = null;
  let mobile = null;

  const handleHashChange = () => {
    const windowId = $selectedWindow.attr('id');
    switch (windowId) {
      case 'instagram': {
        const $titleContainer = $selectedWindow.find('.title-container');
        $titleContainer.empty();
        $titleContainer.append('<div class="icon icon-instagram">');
        $titleContainer.append('<div class="namize">Instagram</div>');
        break;
      }
      default: {
        const $titleContainer = $selectedWindow.find('.title-container');
        $titleContainer.empty();
        $titleContainer.append($firstLauncher.children().clone());
        break;
      }
    }
  };

  $buttonContainer.click(function () {
    if (mobile) {
      const [buttonClose] = $(this).find('.button-close');
      buttonClose.click();
    }
  });
  $buttonContainer.find('.button-close').click(function (e) {
    const $selectedWindow = $(this).parents('.window');
    const id = $selectedWindow.attr('id');
    $(`a[href='#${id}']`).removeClass('active');
    $selectedWindow.removeClass('open');
    $selectedWindow.data('last-hash', null);
    const windowId = $selectedWindow.attr('id');
    switch (windowId) {
      case 'terminal':
        resetTerminal();
        break;
    }
  });

  const paths = {
    users: {
      jason: {
        desktop: {},
      },
    },
  };
  const ids = [];
  $('*').each(function () {
    const { id } = this;
    if (id) {
      ids.push(id);
    }
  });
  for (const id of ids) {
    let path = paths.users.jason.desktop;
    const sections = id.split('-');
    for (const section of sections) {
      if (!path[section]) {
        path[section] = {};
      }
      path = path[section];
    }
  }

  let sourceCode = null;
  $.get('/script.js', (data) => sourceCode = data, 'text');

  let currentDirectories = null;
  const inputHistory = [];
  let inputHistoryIndex = 0;
  let tabPressed = null;
  let hackertyper = null;
  let hackertyperIndex = null;
  const resetTerminal = () => {
    currentDirectories = ['users', 'jason', 'desktop'];
    tabPressed = false;
    resetHackertyper();
    newInputLine(true);
  };
  window.setTimeout(resetTerminal, 0);
  const resetHackertyper = () => {
    hackertyper = false;
    hackertyperIndex = 0;
  };
  const newInputLine = (clear = false, prompt = true) => {
    const $lineContainer = $terminal.find('.line-container');
    if (clear) {
      $lineContainer.empty();
    }
    const $newLine = $('<div class="line">');
    if (prompt) {
      const directories = [...currentDirectories];
      if (directories[0] === 'users' && directories[1] === 'jason') {
        directories.splice(0, 2, '~');
      }
      const path = directories.join('/') || '/';
      $newLine.append(`jason@world:${path}$ `);
    }
    const $cursor = $terminal.find('.cursor');
    $cursor.removeClass('cursor');
    $newLine.append('<div class="letter cursor">');
    $lineContainer.append($newLine);
    return $newLine;
  };
  const getDirectories = (pathArg) => {
    const tokens = pathArg ? pathArg.split('/') : [];
    let directories = [...currentDirectories];
    if (tokens[0] === '') {
      directories = [];
      tokens.shift();
    } else if (tokens[0] === '~') {
      directories = ['users', 'jason'];
      tokens.shift();
    }
    for (const token of tokens) {
      switch (token) {
        case '':
        case '.':
          break;
        case '..':
          directories.pop();
          break;
        default:
          directories.push(token);
          break;
      }
    }
    return directories;
  };
  const getPath = (directories) => {
    let path = paths;
    for (const directory of directories) {
      path = path[directory];
    }
    return path;
  };
  const getSelector = (directories) => '#' + directories.slice(3).join('-');
  const print = (lines, markdown = false) => {
    if (!Array.isArray(lines)) lines = [lines];
    const $lineContainer = $terminal.find('.line-container');
    lines.forEach((line) => {
      const $newLine = $('<div class="line">');
      if (markdown) {
        $newLine.html(line && line
          .replace(/([.,?!"';]*\w*[.,?!"';]*\s*)/g, '<span>$1</span>')
          .replace(/\{(.+)\}/g, '<div class="underline">$1</div>&nbsp;&nbsp;')
          .replace(/\*(.+)\*/g, '<div class="highlight">$1</div>'));
      } else {
        $newLine.html(line);
      }
      $lineContainer.append($newLine);
    });
  };
  const type = (string) => {
    let $cursor = $terminal.find('.cursor');
    reattachCursor($cursor);
    if (string === undefined) return;
    const array = Array.from(string);
    for (const char of array) {
      if (char === '\n') {
        newInputLine(false, false);
        $cursor = $terminal.find('.cursor');
      } else {
        $cursor.before(`<div class="letter">${char}</div>`);
      }
    }
  };
  const reattachCursor = ($cursor) => {
    $cursor.prev().after($cursor);
  };
  const isDir = (path, directory) => Object.keys(path[directory]).length > 0;
  const processCommand = (input) => {
    const [command, ...args] = input.split(/\s+/);
    const pathArgs = args.filter(arg => !arg.startsWith('-'));
    const optionArg = args.find(arg => arg.startsWith('-'));
    const options = optionArg ? optionArg.substring(1).split('') : [];
    switch (command) {
      case '':
        break;
      case 'help': {
        print([
          ' *help*            show all the possible commands',
          ' *whoami* [-j]     display information about Jason',
          ' *cd* {dir}        change the working directory',
          ' *ls* {dir}        list directory contents',
          ' *pwd*             return the working directory',
          ' *rm* [-fr] {dir}  remove directory entries',
          ' *open* {files}    open the files',
          ' *clear*           clear the terminal screen',
          ' *exit*            close the terminal window',
          ' *hackertyper*     ?????',
        ], true);
        break;
      }
      case 'whoami': {
        if (options.includes('j')) {
          window.open('https://www.instagram.com/jspark98/');
        } else {
          print([
            '*Jinseo Park* (Jason)',
            'A CS undergrad at Georgia Tech and a Software (and DevOps) Engineer at Prendssoin. Currently on an exchange program at National University of Singapore. Travelling on a regular basis is a necessity for him.',
            'Type "*whoami -j*" to show some snapshots of his journey.',
          ], true);
        }
        break;
      }
      case 'cd': {
        const pathArg = pathArgs.shift();
        const directories = getDirectories(pathArg);
        const path = getPath(directories);
        if (path === undefined) {
          print(`-bash: ${command}: ${pathArg}: No such file or directory`);
          break;
        } else if (Object.keys(path).length === 0) {
          print(`-bash: ${command}: ${pathArg}: Not a directory`);
          break;
        }
        currentDirectories = [...directories];
        break;
      }
      case 'ls': {
        const pathArg = pathArgs.shift();
        const directories = getDirectories(pathArg);
        const path = getPath(directories);
        if (path === undefined) {
          print(`-bash: ${command}: ${pathArg}: No such file or directory`);
          break;
        } else if (Object.keys(path).length === 0) {
          print(`<div class="file">${directories.pop()}</div>`);
          break;
        }
        print(Object.keys(path).map(directory => `<div class="${isDir(path, directory) ? 'dir' : 'file'}">${directory}</div>`));
        break;
      }
      case 'pwd': {
        print('/' + currentDirectories.join('/'));
        break;
      }
      case 'rm': {
        const pathArg = pathArgs.shift();
        const directories = getDirectories(pathArg);
        const path = getPath(directories);
        if (path === undefined) {
          print(`-bash: ${command}: ${pathArg}: No such file or directory`);
          break;
        } else {
          if (Object.keys(path).length && !options.includes('r')) {
            print(`-bash: ${command}: ${pathArg}: Is a directory`);
            break;
          }
          const selector = getSelector(directories);
          // TODO: wildcard selector?
          if (selector === '#') {
            if (!options.includes('f')) {
              print(`-bash: ${command}: ${pathArg}: Permission denied (try again with -f)`);
              break;
            }
            $('.desktop').remove();
          } else {
            $(`a[href='${selector}']`).remove();
            $(`[id='${selector.substring(1)}']`).remove();
            $(`a[href^='${selector}-']`).remove();
            $(`[id^='${selector.substring(1)}-']`).remove();
          }
          const directory = directories.pop();
          delete getPath(directories)[directory];
          break;
        }
      }
      case 'open': {
        let delay = 0;
        for (const pathArg of pathArgs) {
          const directories = getDirectories(pathArg);
          const path = getPath(directories);
          if (path === undefined) {
            print(`The file /${directories.join('/')} does not exist.`);
            continue;
          }
          if (directories[0] === 'users' && directories[1] === 'jason' && directories[2] === 'desktop') {
            directories.splice(0, 3);
          }
          const hash = '#' + directories.join('-');
          if (hash === '#' || !$(hash).length) {
            print(`-bash: ${command}: ${pathArg}: Permission denied`);
            continue;
          }
          window.setTimeout(() => {
            window.location.hash = hash;
          }, delay += 200);
        }
        break;
      }
      case 'clear': {
        newInputLine(true);
        return;
      }
      case 'exit': {
        const [buttonClose] = $terminal.find('.button-close');
        buttonClose.click();
        return;
      }
      case 'hackertyper': {
        if (sourceCode) {
          hackertyper = true;
          newInputLine(true, false);
          return;
        } else {
          print(`Error occurred while loading source code.`);
        }
        break;
      }
      default: {
        print(`-bash: ${command}: command not found`);
        break;
      }
    }
    newInputLine();
    const [cursor] = $terminal.find('.cursor');
    cursor.scrollIntoView();
  };
  const handleTerminalKeyDown = (e) => {
    const { keyCode } = e;
    switch (keyCode) {
      case 8:
      case 9:
      case 13:
      case 27:
      case 37:
      case 38:
      case 39:
      case 40:
        e.preventDefault();
        break;
    }
    if (hackertyper && keyCode !== 27) return;
    const $cursor = $terminal.find('.cursor');
    const $prev = $cursor.prev('.letter');
    const $next = $cursor.next('.letter');
    const $line = $cursor.parents('.line');
    switch (keyCode) {
      case 8: {
        if ($prev.length) {
          $prev.remove();
          reattachCursor($cursor);
        }
        break;
      }
      case 9: {
        if (!$next.length) {
          const input = $line.children('.letter').text();
          const incompletePathArg = input.split(/\s+/).pop();
          const index = incompletePathArg.lastIndexOf('/');
          const parentDirectory = incompletePathArg.substring(0, index + 1);
          const incompleteDirectory = incompletePathArg.substring(index + 1);
          const directories = getDirectories(parentDirectory);
          const path = getPath(directories);
          if (path) {
            const possibleDirectories = Object.keys(path).filter(directory => directory.startsWith(incompleteDirectory));
            if (possibleDirectories.length === 1) {
              const directory = possibleDirectories[0];
              const leftover = directory.substring(incompleteDirectory.length);
              type(leftover);
            } else if (possibleDirectories.length > 1) {
              if (tabPressed) {
                $cursor.detach();
                $line.before($line.clone());
                for (const directory of possibleDirectories) {
                  $line.before(`<div class="line"><div class="${isDir(path, directory) ? 'dir' : 'file'}">${directory}</div></div>`);
                }
                $cursor.appendTo($line);
              }
              tabPressed = true;
            }
          }
        }
        break;
      }
      case 13: {
        const input = $line.children('.letter').text();
        inputHistory.push(input);
        inputHistoryIndex = inputHistory.length;
        processCommand(input);
        break;
      }
      case 27: {
        resetHackertyper();
        newInputLine();
        break;
      }
      case 37: {
        if ($prev.length) {
          $prev.addClass('cursor');
          $cursor.removeClass('cursor');
        }
        break;
      }
      case 38: {
        if (inputHistoryIndex > 0) {
          const input = inputHistory[--inputHistoryIndex];
          $cursor.detach();
          $line.find('.letter').remove();
          $line.append($cursor);
          type(input);
        }
        break;
      }
      case 39: {
        if ($next.length) {
          $next.addClass('cursor');
          $cursor.removeClass('cursor');
        }
        break;
      }
      case 40: {
        if (inputHistoryIndex < inputHistory.length) {
          const input = inputHistory[++inputHistoryIndex];
          $cursor.detach();
          $line.find('.letter').remove();
          $line.append($cursor);
          type(input);
        }
        break;
      }
    }
    if (keyCode !== 9) tabPressed = false;
    const [cursor] = $cursor;
    cursor.scrollIntoView();
  };
  const handleTerminalKeyPress = (e) => {
    const keyCode = e.charCode || e.keyCode;
    if (keyCode === 3) {
      resetHackertyper();
      newInputLine();
    } else if (keyCode >= 32) {
      if (hackertyper) {
        const randomLength = (Math.random() * 8 | 0) + 1;
        const string = sourceCode.substr(hackertyperIndex, randomLength);
        if (!string) {
          resetHackertyper();
          newInputLine();
        }
        hackertyperIndex += randomLength;
        type(string);
      } else {
        const string = String.fromCharCode(keyCode);
        type(string);
      }
    }
    const [cursor] = $terminal.find('.cursor');
    cursor.scrollIntoView();
  };


  $(document).keydown((e) => {
    if ($directory.hasClass('focus')) {
      handleDirectoryKeyDown(e);
    } else if ($terminal.hasClass('focus')) {
      handleTerminalKeyDown(e);
    }
  });
  $(document).keypress((e) => {
    if ($terminal.hasClass('focus')) {
      handleTerminalKeyPress(e);
    }
  });

  const onResize = () => {
    const { clientWidth } = document.body;
    desktop = clientWidth > 512;
    mobile = !desktop;
    $html.toggleClass('desktop', desktop);
    $html.toggleClass('mobile', mobile);
  };
  onResize();
  window.onresize = onResize;
});
