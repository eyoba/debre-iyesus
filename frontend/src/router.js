import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('./views/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('./views/Home.vue')
      },
      {
        path: 'news',
        name: 'NewsPage',
        component: () => import('./views/NewsPage.vue')
      },
      {
        path: 'events',
        name: 'EventsPage',
        component: () => import('./views/EventsPage.vue')
      },
      {
        path: 'gallery',
        name: 'GalleryPage',
        component: () => import('./views/GalleryPage.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('./views/AdminLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'AdminLogin',
        component: () => import('./views/AdminLogin.vue')
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('./views/AdminDashboard.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'church-info',
        name: 'ChurchInfo',
        component: () => import('./views/ChurchInfo.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
      },
      {
        path: 'news',
        name: 'NewsManager',
        component: () => import('./views/NewsManager.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'events',
        name: 'EventsManager',
        component: () => import('./views/EventsManager.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'gallery',
        name: 'GalleryManager',
        component: () => import('./views/GalleryManager.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'members',
        name: 'MembersList',
        component: () => import('./views/MembersList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'members/add',
        name: 'AddMember',
        component: () => import('./views/AddMember.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'members/edit/:id',
        name: 'EditMember',
        component: () => import('./views/EditMember.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'send-sms',
        name: 'SendSMS',
        component: () => import('./views/SendSMS.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'sms-logs',
        name: 'SMSLogs',
        component: () => import('./views/SMSLogs.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'kontingent',
        name: 'MembersKontingent',
        component: () => import('./views/MembersKontingent.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'baptism',
        name: 'BaptismList',
        component: () => import('./views/BaptismList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'baptism/add',
        name: 'AddBaptism',
        component: () => import('./views/AddBaptism.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'baptism/edit/:id',
        name: 'EditBaptism',
        component: () => import('./views/EditBaptism.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'admins',
        name: 'AdminManagement',
        component: () => import('./views/AdminManagement.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('./views/ChangePassword.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token');

  if (to.meta.requiresAuth && !token) {
    next('/admin/login');
  } else {
    next();
  }
});

export default router;