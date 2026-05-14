/**
 * 850 Tech Gurus CMS — Connect SDK
 * ──────────────────────────────────────────────────────────────────────────────
 * Add to any website: <script src="https://your-cms-url.com/sdk/connect.js"
 *                              data-client="YOUR_CLIENT_ID"></script>
 *
 * Then use:
 *   window.CMS.ready(function(site) { ... })
 *   <span data-cms="phone"></span>
 *   <img  data-cms="logo" />
 *   <nav  data-cms="navigation"></nav>
 *   <form data-cms-form="Contact Form">...</form>
 *
 * Version: 1.0.0 | https://850techgurus.com
 * ──────────────────────────────────────────────────────────────────────────────
 */
;(function (window, document) {
  'use strict'

  var VERSION = '1.0.0'

  /* ─── Detect CMS base URL from script src ──────────────────────────────── */
  var BASE_URL = (function () {
    var scripts = document.querySelectorAll('script[src*="connect.js"]')
    for (var i = scripts.length - 1; i >= 0; i--) {
      try {
        var u = new URL(scripts[i].src)
        return u.origin
      } catch (_) {}
    }
    return 'https://cms.850techgurus.com'
  })()

  /* ─── Read clientId from data-client or data-client-id attribute ────────── */
  var clientId = (function () {
    var scripts = document.querySelectorAll('script[src*="connect.js"]')
    for (var i = scripts.length - 1; i >= 0; i--) {
      var id = scripts[i].getAttribute('data-client') ||
               scripts[i].getAttribute('data-client-id')
      if (id) return id
    }
    return null
  })()

  /* ─── State ─────────────────────────────────────────────────────────────── */
  var _data       = null
  var _loaded     = false
  var _callbacks  = []

  /* ─── Auto-inject text/links/images ────────────────────────────────────── */
  function inject(data) {
    /* Simple text fields */
    var fields = {
      siteName:  ['[data-cms="siteName"]',  '[data-cms="site-name"]',  '.cms-site-name'],
      tagline:   ['[data-cms="tagline"]',                               '.cms-tagline'],
      phone:     ['[data-cms="phone"]',                                 '.cms-phone'],
      email:     ['[data-cms="email"]',                                 '.cms-email'],
      address:   ['[data-cms="address"]',                               '.cms-address'],
      hours:     ['[data-cms="hours"]',                                 '.cms-hours'],
    }

    Object.keys(fields).forEach(function (key) {
      if (!data[key]) return
      fields[key].forEach(function (sel) {
        each(document.querySelectorAll(sel), function (el) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = data[key]
          } else {
            el.textContent = data[key]
          }
        })
      })
    })

    /* Phone links */
    if (data.phone) {
      each(document.querySelectorAll('[data-cms="phone-link"]'), function (el) {
        el.href = 'tel:' + data.phone.replace(/[\s().-]/g, '')
        if (!el.textContent.trim()) el.textContent = data.phone
      })
    }

    /* Email links */
    if (data.email) {
      each(document.querySelectorAll('[data-cms="email-link"]'), function (el) {
        el.href = 'mailto:' + data.email
        if (!el.textContent.trim()) el.textContent = data.email
      })
    }

    /* Logo */
    if (data.logo) {
      each(document.querySelectorAll('[data-cms="logo"]'), function (el) {
        if (el.tagName === 'IMG') {
          el.src = data.logo
          if (!el.alt) el.alt = data.siteName || 'Logo'
        } else {
          var img = document.createElement('img')
          img.src = data.logo
          img.alt = data.siteName || 'Logo'
          img.style.maxHeight = '100%'
          el.appendChild(img)
        }
      })
    }

    /* Navigation */
    if (data.navigation && data.navigation.length > 0) {
      each(document.querySelectorAll('[data-cms="navigation"]'), function (el) {
        el.innerHTML = data.navigation.map(function (item) {
          var sub = ''
          if (item.children && item.children.length) {
            sub = '<ul>' + item.children.map(function (c) {
              return '<li><a href="' + esc(c.url) + '">' + esc(c.label) + '</a></li>'
            }).join('') + '</ul>'
          }
          return '<li><a href="' + esc(item.url) + '">' + esc(item.label) + '</a>' + sub + '</li>'
        }).join('')
      })
    }

    /* Social links */
    if (data.social) {
      Object.keys(data.social).forEach(function (platform) {
        var url = data.social[platform]
        if (!url) return
        each(
          document.querySelectorAll('[data-cms="social-' + platform.toLowerCase() + '"]'),
          function (el) {
            el.href = url
            el.target = el.target || '_blank'
            el.rel = el.rel || 'noopener noreferrer'
          }
        )
      })
    }

    /* CSS custom properties */
    if (data.primaryColor)   document.documentElement.style.setProperty('--cms-primary',   data.primaryColor)
    if (data.secondaryColor) document.documentElement.style.setProperty('--cms-secondary', data.secondaryColor)
  }

  /* ─── Auto-hook forms with data-cms-form attribute ──────────────────────── */
  function hookForms() {
    each(document.querySelectorAll('[data-cms-form]'), function (form) {
      if (form.dataset.cmsHooked) return
      form.dataset.cmsHooked = '1'

      form.addEventListener('submit', function () {
        var formName = form.getAttribute('data-cms-form') || 'Contact Form'
        var fields = {}
        each(form.querySelectorAll('input, textarea, select'), function (inp) {
          if (inp.name && inp.value !== undefined) fields[inp.name] = inp.value
        })
        /* Fire and forget — does not block form submission */
        fetch(BASE_URL + '/api/v1/submit/' + clientId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formName: formName, fields: fields, page: window.location.href }),
        }).catch(function () {})
      })
    })
  }

  /* ─── Load site data ────────────────────────────────────────────────────── */
  function init() {
    if (!clientId) {
      console.warn('[850 CMS] Missing data-client attribute on <script> tag.')
      return
    }

    fetch(BASE_URL + '/api/v1/site/' + clientId)
      .then(function (res) { return res.json() })
      .then(function (data) {
        _data   = data
        _loaded = true
        inject(data)
        hookForms()
        /* Fire queued callbacks */
        for (var i = 0; i < _callbacks.length; i++) {
          try { _callbacks[i](data) } catch (e) { console.error('[850 CMS]', e) }
        }
        _callbacks = []
        /* DOM event for framework integrations */
        document.dispatchEvent(new CustomEvent('cms:ready', { detail: data }))
      })
      .catch(function (err) {
        console.error('[850 CMS] Failed to load site data:', err)
        document.dispatchEvent(new CustomEvent('cms:error', { detail: err }))
      })
  }

  /* ─── Helpers ───────────────────────────────────────────────────────────── */
  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i])
  }
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /* ─── Public API ────────────────────────────────────────────────────────── */
  window.CMS = {
    version:  VERSION,
    clientId: clientId,

    /** Register callback — fires immediately if already loaded */
    ready: function (cb) {
      if (_loaded && _data) { try { cb(_data) } catch (e) {} }
      else _callbacks.push(cb)
    },

    /** Raw site data object (null before loaded) */
    getData: function () { return _data },

    /** Get a top-level field, e.g. CMS.get('phone') */
    get: function (key) { return _data ? _data[key] : null },

    /** Programmatically submit a form */
    submitForm: function (formName, fields) {
      return fetch(BASE_URL + '/api/v1/submit/' + clientId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName: formName,
          fields:   fields,
          page:     window.location.href,
        }),
      }).then(function (r) { return r.json() })
    },

    /** Reload data from CMS (e.g. after settings change) */
    refresh: function () {
      _loaded   = false
      _data     = null
      _callbacks = []
      init()
    },
  }

  /* ─── Auto-init ─────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    /* already interactive or complete */
    setTimeout(init, 0)
  }

})(window, document)
