window.Tunes = Ember.Application.create();

Tunes.Router.map(function() {
  this.route('library');        // this is our default route
});

Tunes.ApplicationRoute = Ember.Route.extend({
  // TODO: possibly explain why we need to manually define a controller
  // here when it was not necessary to do so for the other routes.
  // Also, explain why we are doing this in ApplicationRoute and not
  // PlaylistRoute, etc.
  setupController: function() {
    this.controllerFor('playlist').set('content', []);
  },

  events: {
    // TODO: explain why we put this here instead of a controller
    queueAlbum: function(album) {
      // NOTE: we use addObject to prevent queueing duplicates
      this.controllerFor('playlist').addObject(album);
    }
  }
});

// TODO: explain ApplicationRoute and IndexRoute defaults and why we override
// here for a different default route
Tunes.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('library');
  }
});

Tunes.LibraryRoute = Ember.Route.extend({
  model: function() {
    var content = [];

    $.ajax({
      url: '/albums.json',
      success: function(data) {
        content.pushObjects(data);
      }
    });

    return content;
  }
});

Tunes.PlaylistView = Em.View.extend({
  classNames: ['playlist']
});

Tunes.LibraryView = Em.View.extend({
  tagName: 'section',

  classNames: ['library']
});

Tunes.PlayerView = Em.View.extend({
  tagName: 'nav'
});

Tunes.PlaylistController = Em.ArrayController.extend({
  currentTrack: null,

  addObject: function(album) {
    this.get('content').addObject(album);

    // Set the currentTrack if this was the first album queued
    if (this.get('content').length === 1) {
      this.set('currentTrack', this.get('tracks.firstObject'));
    }
  },

  removeObject: function(album) {
    this.get('content').removeObject(album);

    // Wipe the currentTrack if this was the last album dequeued
    if (this.get('content').length === 0) {
      this.set('currentTrack', this.get('tracks.firstObject'));
    }
  },

  // NOTE: first CP! we are using instead of doing something similar to
  // backbone screencast to avoid having the implementation diverge from
  // domain model
  tracks: function() {
    return (this.get('content') || []).reduce(function(res, album) {
      return res.concat(album.tracks);
    }, []);
  }.property('content.@each')
});