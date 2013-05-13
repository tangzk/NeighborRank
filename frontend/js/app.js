App = Ember.Application.create({
	LOG_TRANSITIONS: true
});

Ember.TextSupport.reopen({
  attributeBindings: ["autofocus", "class", "id"]
});

App.Searchbox = Ember.TextField.extend({
	placeholder: "Type your query (quantum, algorithms, ...)",
	id: "appendedInputButton",
	type: "text",
	autofocus: "autofocus"
});

// Result model
App.Result = Ember.Object.extend({
});

App.Result.reopenClass({
    all: function(query) {
        if (query === undefined) { return; }

        var results = Em.A();
	    $.getJSON("http://localhost:8080/results/" + query,
	        function (response) {
                response.results.forEach(function(child) {
                    results.addObject(App.Result.create(child));
                });
	        }).error(function (x, y, z) {
	            console.log(JSON.stringify(x) + " " + y + " " + z);
	        });
	    return results;
    }
});

//
//App.Result.FIXTURES = [
//    {
//    id: 10,
//    docid: 1,
//    title: 'An analogue of the Szemeredi Regularity Lemma for bounded degree graphs',
//    summary: 'We show that a sufficiently large graph of bounded degree can be decomposed into quasi-homogeneous pieces. The result can be viewed as a "finitarization" of the classical Farrell-Varadarajan Ergodic Decomposition Theorem.',
//    },
//    {
//    id: 11,
//    docid: 2,
//    title: 'Drift-diffusion model for spin-polarized transport in a non-degenerate 2DEG controlled by a spin-orbit interaction',
//    summary: 'We apply the Wigner function formalism to derive drift-diffusion transport equations for spin-polarized electrons in a III-V semiconductor single quantum well. Electron spin dynamics is controlled by the linear in momentum spin-orbit interaction. In a studied transport regime an electron momentum scattering rate is appreciably faster than spin dynamics. A set of transport equations is defined in terms of a particle density, spin density, and respective fluxes. The developed model allows studying of coherent dynamics of a non-equilibrium spin polarization. As an example, we consider a stationary transport regime for a heterostructure grown along the (0, 0, 1) crystallographic direction. Due to the interplay of the Rashba and Dresselhaus spin-orbit terms spin dynamics strongly depends on a transport direction. The model is consistent with results of pulse-probe measurement of spin coherence in strained semiconductor layers. It can be useful for studying properties of spin-polarized transport and modeling of spintronic devices operating in the diffusive transport regime.',
//    },
//    {
//    id: 12,
//    docid: 3,
//    title: 'Optical conductivity of a quasi-one-dimensional system with fluctuating order',
//    summary: 'We describe a formally exact method to calculate the optical conductivity of a one-dimensional system with fluctuating order. For classical phase fluctuations we explicitly determine the optical conductivity by solving two coupled Fokker-Planck equations numerically. Our results differ considerably from perturbation theory and in contrast to Gaussian order parameter fluctuations show a strong dependence on the correlation length.',
//    }
//];

App.Router.map(function() {
    this.route('index', { path: '/'});
	this.route('search', { path: 'search/:query/:rels' });
});

App.IndexView = Ember.View.extend({
    resultCheckbox: Ember.Checkbox.extend({
        checked: false,
        checkedObserver: function(x, y) {
            item = this.get('content');
            this.get('controller').toggleRelevance(item.get('docid'))
        }.observes('checked')
    })
});

App.IndexController = Ember.Controller.extend({
	query: '',
	relevant: new Ember.Set(),
	toggleRelevance: function(id) {
        rels = this.get('relevant');
        if (rels.contains(id)) {
            rels.remove(id);
        } else {
            rels.add(id);
        }
	},
	doSearch: function() {
	    console.log("getting stuff...");
	    console.log(this.get('model'));
	    this.set('model', App.Result.all(this.get('query')));
	},
	sendRelevant: function() {
	    relIds = this.get('relevant').toArray();
	    this.transitionToRoute('search', { query: this.get("query"), rels: relIds });
	}
});

App.IndexRoute = Ember.Route.extend({
    model: function() {
        return App.Result.all();
    }
});

App.SearchRoute = Ember.Route.extend({
    serialize: function(params, context) {
        return params;
    },
    model: function(params) {
        console.log(params.query);
        return App.Result.all(params.query);
    },
    setupController: function(controller, model) {
        //controller.set("model", App.Result.all(model.get('query')));
    }
});