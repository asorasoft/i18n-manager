
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'create', name: 'create-project', component: () => import('pages/Create.vue') },
      { path: 'edit-config/:configIndex', name: 'edit-config', component: () => import('pages/Create.vue') },
      { path: 'workspace/:configIndex', name: 'workspace', component: () => import('pages/Workspace.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
