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
      success: function(albums) {
        // NOTE: this is a small workaround so that tracks can refer back to
        // their parent albums. It would not be necessary if we were using
        // Ember Data.
        var albums = albums.map(function(album){
          var tracks = album.tracks.map(function(track){
            return $.extend(track, {album: album});
          });
          return $.extend(album, {tracks: tracks});
        });

        content.pushObjects(albums);
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

  currentAlbum: function() {
    return this.get('currentTrack.album');
  }.property('currentTrack'),

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

Tunes.PlaylistAlbumController = Em.ObjectController.extend({
  needs: ['playlist'],

  currentAlbum: Em.computed.alias('controllers.playlist.currentAlbum'),

  current: function() {
    return this.get('content') === this.get('currentAlbum');
  }.property('content', 'currentAlbum')
});

Tunes.PlaylistTrackController = Em.ObjectController.extend({
  needs: ['playlist'],

  currentTrack: Em.computed.alias('controllers.playlist.currentTrack'),

  current: function() {
    return this.get('content') === this.get('currentTrack');
  }.property('content', 'currentTrack')
});