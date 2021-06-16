/*
 * boot.js
 */

const process = require('process');
const argv = process.argv.slice(process.argv.indexOf('--') !== -1
                                ? process.argv.indexOf('--') + 1
                                : 1);
const getopt = require('minimist');
const options = getopt(argv);

const option_vendor = new Map([
  [ 'wechat',  { name: 'wechat',  ver: '1.05.2105170', } ],
  [ 'alipay',  { name: 'alipay',  ver: '2.0.6', } ],
]);
const option_host = new Map([
  [ 'nw', { name: 'nw', ver: '0.54.0', } ],
]);


const help = [
  "usage: yaddt.sh [options and files]",
  "options:",
  "  -h, --help                              display this help",
  "  --vendor=[wechat,alipay]                default is wechat dev tool",
  "  --host=[nw,electron]                    default is nw.js",
  "  --install                               install mini program dev tool and host",
  "  --run                                   run mini programm dev tool",
  "  --version                               print version and exit",
  "",
  "examples:",
  '  yaddt.sh --run',
  `  yaddt.sh --vendor='${JSON.stringify(option_vendor.get("wechat"))}'  \\`,
  `           --host='${JSON.stringify(option_host.get("wechat"))}'  \\`,
  '           --install',
  `  yaddt.sh --vendor='${JSON.stringify(option_vendor.get("wechat"))}'  \\`,
  `           --host='${JSON.stringify(option_host.get("wechat"))}'  \\`,
  '           --run',
].join("\n");


function download(options, url, path, after) {
  console.log('# try to download %s via %s', url, options);
  const { exec } = require('child_process');
  exec(`curl -sqL -O${url} -o${path}`, after);
}

function install_wechat(options) {
  const fs = require('fs');
  const dist_dir = `${options.cwd}/dist`;

  // copy nw.js
  const nw_tgz = `${options.hostPath}/nwjs-v${options.host.ver}-linux-${process.arch}.tar.gz`;
  if (!fs.existsSync(nw_tgz)) {
    // download
  }

  // extract nw_tgz to dist
  const { exec } = require('child_process');
  exec(`tar xvfz ${nw_tgz} -C ${dist_dir} --strip-components=1`, (e, _, __) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
  });

  // extract vendor_exe to dist
  const vendor_exe = `${options.vendorPath}/wechat_devtools_${options.vendor.ver}_${options.arch}.exe`;
  exec(`7z x -o${dist_dir}/ ${vendor_exe} -y`, (e) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
  });
  
  // decorate package.json
  const package_json = `${dist_dir}/code/package.nw/package.json`;
  fs.readFile(package_json, 'utf-8', (e, d) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
    fs.copyFile(package_json, `${package_json}.b0`, (e1) => {
      if (e1) {
        console.error(e1);
        // process.exit(1);
      }
    });
    const n = d.replace(/微信开发者工具/gim, 'wechat_web_devtools');
    fs.writeFile(package_json, n, 'utf-8', (e2, _) => {
      if (e2) {
        console.error(e2);
        // process.exit(1);
      }
    });
  });

  // link package.nw
  const dir_package_nw = `${dist_dir}/code/package.nw`;
  const ln_package_nw = `${dist_dir}/package.nw`;
  if (fs.existsSync(ln_package_nw)) {
    fs.unlinkSync(ln_package_nw);
  }
  fs.symlinkSync(dir_package_nw, ln_package_nw);

  // link node
  const ln_node = `${dist_dir}/node`;
  const ln_node_exe = `${dist_dir}/node.exe`;
  if (fs.existsSync(ln_node)) {
    fs.unlinkSync(ln_node);
  }
  fs.symlinkSync(process.execPath, ln_node);
  if (fs.existsSync(ln_node_exe)) {
    fs.unlinkSync(ln_node_exe);
  }
  fs.symlinkSync(process.execPath, ln_node_exe);

  // clean locales
  const locale_dir = `${dist_dir}/locales/`;
  fs.readdir(locale_dir, (e, files) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
    for (const f of files) {
      if (!f.match(/(^zh\-CN.*)|(^en\-US.*)/)) {
        fs.unlinkSync(`${locale_dir}/${f}`);
      }
    }
  });
}

function install(options) {
  console.log('# install ...');
  const fs = require('fs');

  // create dist dir
  const dist_dir = `${options.cwd}/dist`;
  if (fs.existsSync(dist_dir)) {
    fs.rmdir(dist_dir, { recursive: true }, (e) => {
      if (e) {
        console.error(e);
        process.exit(1);
      }
      fs.mkdirSync(dist_dir);      
    });
  }

  switch (options.vendor.name) {
  case 'wechat':
    {
      return install_wechat(options);
    }
  default:
    console.error('!panic, unknown vendor');
    process.exit(1);
  }
  // const arch = process.arch;



  // const [ ver, arch = process.arch ] = options.install.split('_');
  // console.log('ver=%s, arch=%s', ver, arch);

  // const vdir = `vendor/${options.vendor}/${ver}/${arch}`;
  // const fs = require('fs');
  // fs.mkdir(`${cwd}/${vdir}`, { recursive: true }, (e) => {
  //   if (e) {
  //     console.error(e);
  //     // process.exit(1);
  //   }
  // });

  // const vbag = `vendor/${options.vendor}/wechat_devtools_${ver}_${arch}.exe`;
  // const { exec } = require('child_process');
  // exec(`7z x -o${cwd}/${vdir} ${cwd}/${vbag} -y`, (e, _, __) => {
  //   if (e) {
  //     console.error(e);
  //     // process.exit(1);
  //   }
  // });

  // const fsx = require('fs-extra');

}

function run_wechat(options) {
  const dist_dir = `${options.cwd}/dist`;
  const nw = `${dist_dir}/nw`;
  const ext = `${dist_dir}/package.nw/js/ideplugin`;
  process.env['LANG'] = 'zh_CN.UTF-8';
  process.env['APPDATA'] = dist_dir;
  process.env['PATH'] = `${dist_dir}:${process.env['PATH']}`;

  const { execFile } = require('child_process');
  execFile(nw, ['--disable-gpu', `--load-extension=${ext}`], (e, _, __) => {
    if (e) {
      console.error(e);
      // process.exit(1);
    }
  });
}

function run(options) {
  console.log('# run %s@%s ...', options.vendor.name, options.host.name);
  if ('wechat' === options.vendor.name) {
    run_wechat(options);
    return;
  }

}


if ((options._ && options.length > 0)
    || (options.h || options.help)) {
  console.log(help);
  process.exit(1);
}

// boot option:
{
  options.cwd = process.cwd();
  options.arch = process.arch;
}

// vendor option:
{
  const opt = typeof(options.vendor) === 'string'
        ? JSON.parse(options.vendor)
        : options.vendor || '';
  options.vendor = {
    name: opt && opt.name || 'wechat',
    ver: opt && opt.ver || option_vendor.get('wechat').ver,
  };
  // options.vendorPath = `${process.cwd()}/vendor/${options.vendor.name}/${options.vendor.ver}/${process.arch}`;
  options.vendorPath = `${options.cwd}/vendor/${options.vendor.name}`;
}

// host option:
{
  const opt = typeof(options.host) === 'string'
        ? JSON.parse(options.host)
        : options.host || '';
  const h = {
    name: opt.host && opt.host.name || 'nw',
    ver: opt.host && opt.host.ver || option_host.get('nw').ver,
  };
  options.host = h;
  // options.hostPath = `${process.cwd()}/host/${options.host.name}/${options.host.ver}/${process.arch}`;
  options.hostPath = `${options.cwd}/host/${options.host.name}`;
}


console.log('# command line: %s', JSON.stringify(options, null, 2));

// install
if (options.install) {
  install(options);
  process.exit(0);
}

// run
if (options.run) {
  run(options);
  process.exit(0);
}

// exit
console.log(help);
process.exit(1);



/* eof */
