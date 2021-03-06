module.exports = {
    checks: [
        function systemStack() {
            var os = require('os'),
                chalk = require('chalk'),
                Promise = require('bluebird'),
                execa = require('execa'),
                errors = [];

            // Because we use `lsb_release` to determine the platform,
            // platform is not linux we just return an error
            if (os.platform() !== 'linux') {
                return chalk.yellow('Platform is not Linux');
            }

            return execa.shell('lsb_release -a').then(function (result) {
                if (!result.stdout.match(/Ubuntu 16/)) {
                    errors.push(chalk.yellow('Linux version is not Ubuntu 16'));
                }

                function checkPackage(name) {
                    return execa.shell(`dpkg -l | grep ${name}`).catch(function (error) {
                        if (error.code === 1) {errors.push(chalk.yellow(`Missing package: ${name}`));}
                    });
                }

                return Promise.all([
                    checkPackage('systemd'),
                    checkPackage('nginx')
                ]);
            }).then(function () {
                return errors.length ? errors.join(os.eol) : true;
            });
        }
    ],
    messages: {
        systemStack: 'System is running Ghost recommended system stack'
    }
};
