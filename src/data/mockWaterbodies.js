export const MOCK_WATERBODIES = [
  {
    id: 'wb-001',
    name: 'Citarum River Basin',
    city: 'Bandung',
    region: 'West Java',
    country: 'Indonesia',
    location: 'Bandung, West Java, Indonesia',
    type: 'River',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
    attentionLevel: 'Critical',
    attentionColor: 'red',
    description: 'Severe accumulation of industrial runoff, textile waste, and dense plastic debris impacting downstream agricultural communities and marine life.',
    environmentalIssues: [
      'Industrial chemical runoff from textile mills',
      'High-density floating single-use plastic waste',
      'Uncontrolled illegal dumping along riverbanks',
      'Hypoxia dead zones threatening native fish species'
    ],
    coordinates: { lat: -6.9147, lng: 107.6098 },
    isFeatured: true,
    cleanupStatus: 'Needs Attention',
    cleanupEvent: null
  },
  {
    id: 'wb-002',
    name: 'Golden Sands Coast & Dunes',
    city: 'Sydney',
    region: 'New South Wales',
    country: 'Australia',
    location: 'Sydney, New South Wales, Australia',
    type: 'Beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    attentionLevel: 'High Urgency',
    attentionColor: 'orange',
    description: 'Coastal storm debris and microplastic fragmentation threatening delicate dune nesting grounds for endangered migratory shorebirds.',
    environmentalIssues: [
      'Microplastic accumulation in intertidal sand layers',
      'Ghost fishing nets trapped in rocky reefs',
      'High tourist litter density along coastal paths',
      'Threats to nesting Little Penguins and sea turtles'
    ],
    coordinates: { lat: -33.8688, lng: 151.2093 },
    isFeatured: true,
    cleanupStatus: 'Needs Attention',
    cleanupEvent: null
  },
  {
    id: 'wb-003',
    name: 'Great Lakes Wetland Reserve',
    city: 'Cleveland',
    region: 'Ohio',
    country: 'United States',
    location: 'Cleveland, Ohio, United States',
    type: 'Lake',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800',
    attentionLevel: 'Moderate',
    attentionColor: 'yellow',
    description: 'Seasonal algae bloom residue and single-use packaging accumulating in public park fishing havens and shallow wetland inlets.',
    environmentalIssues: [
      'Microplastic pellet ingestion risk for waterfowl',
      'Seasonal urban storm drain runoff',
      'Abandoned recreational fishing line entanglements'
    ],
    coordinates: { lat: 41.4993, lng: -81.6944 },
    isFeatured: true,
    cleanupStatus: 'Needs Attention',
    cleanupEvent: null
  }
];
