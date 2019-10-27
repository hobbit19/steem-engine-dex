import { PLATFORM } from 'aurelia-pal';
import { PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

export class AdminAdmin {
    private router: Router;
    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: ['', 'home'],
                name: 'adminHome',
                moduleId: PLATFORM.moduleName('./home'),
                nav: true,
                title: 'Home'
            },
            {
                route: 'kyc',
                name: 'adminKyc',
                moduleId: PLATFORM.moduleName('./kyc'),
                nav: true,
                title: 'Kyc'
            },
            {
                route: 'settings',
                name: 'adminSettings',
                moduleId: PLATFORM.moduleName('./settings'),
                nav: true,
                title: 'Settings'
            }
        ]);

        this.router = router;
    }
}
