import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, uuid, bigint, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  RESEARCHER = 'researcher',
  GUEST = 'guest'
}

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 20 }).notNull().default(UserRole.RESEARCHER),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// Papers table
export const papers = pgTable('papers', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  title: text('title').notNull(),
  abstract: text('abstract'),
  authors: jsonb('authors').default([]),
  categories: jsonb('categories').default([]),
  publishedAt: timestamp('published_at'),
  arxivId: varchar('arxiv_id', { length: 50 }),
  semanticScholarId: varchar('semantic_scholar_id', { length: 100 }),
  pdfUrl: text('pdf_url'),
  doi: varchar('doi', { length: 255 }),
  venue: varchar('venue', { length: 255 }),
  citationCount: integer('citation_count').default(0),
  metadata: jsonb('metadata').default({}),
  source: varchar('source', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  titleIdx: index('papers_title_idx').on(table.title),
  arxivIdx: index('papers_arxiv_idx').on(table.arxivId),
  sourceIdx: index('papers_source_idx').on(table.source),
  publishedIdx: index('papers_published_idx').on(table.publishedAt),
}));

// User saved papers
export const userSavedPapers = pgTable('user_saved_papers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  paperId: integer('paper_id').references(() => papers.id, { onDelete: 'cascade' }),
  savedAt: timestamp('saved_at').defaultNow(),
  tags: jsonb('tags').default([]),
  notes: text('notes'),
}, (table) => ({
  userPaperIdx: index('user_saved_papers_user_paper_idx').on(table.userId, table.paperId),
}));

// User search history
export const searchHistory = pgTable('search_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  filters: jsonb('filters').default({}),
  resultsCount: integer('results_count').default(0),
  searchType: varchar('search_type', { length: 20 }).default('keyword'), // keyword, semantic
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('search_history_user_idx').on(table.userId),
  queryIdx: index('search_history_query_idx').on(table.query),
}));

// Annotations
export const annotations = pgTable('annotations', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  paperId: integer('paper_id').references(() => papers.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  startOffset: integer('start_offset'),
  endOffset: integer('end_offset'),
  highlightText: text('highlight_text'),
  annotationType: varchar('annotation_type', { length: 20 }).default('highlight'), // highlight, comment, note
  isPrivate: boolean('is_private').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userPaperIdx: index('annotations_user_paper_idx').on(table.userId, table.paperId),
}));

// Notebooks for collaborative editing
export const notebooks = pgTable('notebooks', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').default(''),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 255 }),
  isPublic: boolean('is_public').default(false),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  ownerIdx: index('notebooks_owner_idx').on(table.ownerId),
  titleIdx: index('notebooks_title_idx').on(table.title),
}));

// Notebook collaborators
export const notebookCollaborators = pgTable('notebook_collaborators', {
  id: serial('id').primaryKey(),
  notebookId: integer('notebook_id').references(() => notebooks.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  permission: varchar('permission', { length: 20 }).default('read'), // read, write, admin
  addedAt: timestamp('added_at').defaultNow(),
}, (table) => ({
  notebookUserIdx: index('notebook_collaborators_notebook_user_idx').on(table.notebookId, table.userId),
}));

// Teams for collaboration
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  ownerIdx: index('teams_owner_idx').on(table.ownerId),
  nameIdx: index('teams_name_idx').on(table.name),
}));

// Team members
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).default('member'), // owner, admin, member, viewer
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  teamUserIdx: index('team_members_team_user_idx').on(table.teamId, table.userId),
}));

// Paper summaries
export const paperSummaries = pgTable('paper_summaries', {
  id: serial('id').primaryKey(),
  paperId: integer('paper_id').references(() => papers.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  summaryType: varchar('summary_type', { length: 20 }).default('extractive'), // extractive, abstractive
  content: text('content').notNull(),
  model: varchar('model', { length: 100 }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  paperIdx: index('paper_summaries_paper_idx').on(table.paperId),
  userIdx: index('paper_summaries_user_idx').on(table.userId),
}));

// Job queue tracking
export const jobQueue = pgTable('job_queue', {
  id: serial('id').primaryKey(),
  jobId: varchar('job_id', { length: 255 }).notNull().unique(),
  jobType: varchar('job_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, processing, completed, failed
  data: jsonb('data').default({}),
  result: jsonb('result').default({}),
  error: text('error'),
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  jobIdIdx: index('job_queue_job_id_idx').on(table.jobId),
  statusIdx: index('job_queue_status_idx').on(table.status),
  typeIdx: index('job_queue_type_idx').on(table.jobType),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedPapers: many(userSavedPapers),
  searchHistory: many(searchHistory),
  annotations: many(annotations),
  ownedNotebooks: many(notebooks),
  notebookCollaborations: many(notebookCollaborators),
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
  summaries: many(paperSummaries),
}));

export const papersRelations = relations(papers, ({ many }) => ({
  savedByUsers: many(userSavedPapers),
  annotations: many(annotations),
  summaries: many(paperSummaries),
}));

export const userSavedPapersRelations = relations(userSavedPapers, ({ one }) => ({
  user: one(users, {
    fields: [userSavedPapers.userId],
    references: [users.id],
  }),
  paper: one(papers, {
    fields: [userSavedPapers.paperId],
    references: [papers.id],
  }),
}));

export const annotationsRelations = relations(annotations, ({ one }) => ({
  user: one(users, {
    fields: [annotations.userId],
    references: [users.id],
  }),
  paper: one(papers, {
    fields: [annotations.paperId],
    references: [papers.id],
  }),
}));

export const notebooksRelations = relations(notebooks, ({ one, many }) => ({
  owner: one(users, {
    fields: [notebooks.ownerId],
    references: [users.id],
  }),
  collaborators: many(notebookCollaborators),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;
export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = typeof annotations.$inferInsert;
export type Notebook = typeof notebooks.$inferSelect;
export type InsertNotebook = typeof notebooks.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type PaperSummary = typeof paperSummaries.$inferSelect;
export type InsertPaperSummary = typeof paperSummaries.$inferInsert;

// ============================================================================
// REVOLUTIONARY FEATURES SCHEMA - Interactive Research Social Network
// ============================================================================

// Paper Forks - "Fork this Paper" functionality
export const paperForks = pgTable('paper_forks', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  originalPaperId: integer('original_paper_id').references(() => papers.id, { onDelete: 'cascade' }),
  forkerId: integer('forker_id').references(() => users.id, { onDelete: 'cascade' }),
  forkTitle: text('fork_title').notNull(),
  forkDescription: text('fork_description'),
  modifications: jsonb('modifications').default({}), // what was changed/modified
  experimentData: jsonb('experiment_data').default({}), // replication results
  status: varchar('status', { length: 20 }).default('active'), // active, archived, merged
  visibility: varchar('visibility', { length: 20 }).default('public'), // public, private, team
  forkCount: integer('fork_count').default(0), // how many times this fork was forked
  isReplication: boolean('is_replication').default(true), // vs modification
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  originalPaperIdx: index('paper_forks_original_idx').on(table.originalPaperId),
  forkerIdx: index('paper_forks_forker_idx').on(table.forkerId),
  statusIdx: index('paper_forks_status_idx').on(table.status),
}));

// Paper Discussions - Inline discussion system
export const paperDiscussions = pgTable('paper_discussions', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  paperId: integer('paper_id').references(() => papers.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references(() => paperDiscussions.id, { onDelete: 'cascade' }),
  sectionId: varchar('section_id', { length: 100 }), // which section of paper
  content: text('content').notNull(),
  discussionType: varchar('discussion_type', { length: 20 }).default('comment'), // comment, question, insight, criticism
  startOffset: integer('start_offset'), // text selection start
  endOffset: integer('end_offset'), // text selection end
  selectedText: text('selected_text'), // highlighted text
  upvotes: integer('upvotes').default(0),
  downvotes: integer('downvotes').default(0),
  isResolved: boolean('is_resolved').default(false),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  paperIdx: index('paper_discussions_paper_idx').on(table.paperId),
  userIdx: index('paper_discussions_user_idx').on(table.userId),
  sectionIdx: index('paper_discussions_section_idx').on(table.sectionId),
  typeIdx: index('paper_discussions_type_idx').on(table.discussionType),
}));

// Research Feed - Social research activity stream
export const researchFeed = pgTable('research_feed', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  actorId: integer('actor_id').references(() => users.id, { onDelete: 'cascade' }), // who did the action
  actionType: varchar('action_type', { length: 50 }).notNull(), // paper_forked, experiment_completed, discovery_shared, etc.
  entityType: varchar('entity_type', { length: 50 }).notNull(), // paper, experiment, discovery, collaboration
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  entityTitle: text('entity_title'),
  actionData: jsonb('action_data').default({}), // specific details about the action
  visibility: varchar('visibility', { length: 20 }).default('public'), // public, followers, private
  engagement: jsonb('engagement').default({}), // likes, shares, comments count
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('research_feed_user_idx').on(table.userId),
  actorIdx: index('research_feed_actor_idx').on(table.actorId),
  actionIdx: index('research_feed_action_idx').on(table.actionType),
  createdIdx: index('research_feed_created_idx').on(table.createdAt),
}));

// Live Experiments - Real-time experiment sharing
export const liveExperiments = pgTable('live_experiments', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  experimentId: varchar('experiment_id', { length: 255 }).notNull(),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('running'), // running, paused, completed, failed
  isLiveStreaming: boolean('is_live_streaming').default(false),
  viewerCount: integer('viewer_count').default(0),
  streamData: jsonb('stream_data').default({}), // real-time metrics, logs
  collaborators: jsonb('collaborators').default([]), // users who can participate
  chatEnabled: boolean('chat_enabled').default(true),
  recordingEnabled: boolean('recording_enabled').default(false),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
}, (table) => ({
  ownerIdx: index('live_experiments_owner_idx').on(table.ownerId),
  statusIdx: index('live_experiments_status_idx').on(table.status),
  streamingIdx: index('live_experiments_streaming_idx').on(table.isLiveStreaming),
}));

// Global Collaboration Sessions
export const collaborationSessions = pgTable('collaboration_sessions', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  initiatorId: integer('initiator_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionType: varchar('session_type', { length: 50 }).notNull(), // research_pair, mentoring, group_work, paper_review
  title: text('title').notNull(),
  description: text('description'),
  participants: jsonb('participants').default([]), // user IDs and roles
  timezones: jsonb('timezones').default([]), // participant timezone info
  scheduledTime: timestamp('scheduled_time'),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  sessionData: jsonb('session_data').default({}), // shared documents, notes, etc.
  recordings: jsonb('recordings').default([]), // session recordings if enabled
  status: varchar('status', { length: 20 }).default('scheduled'), // scheduled, active, completed, cancelled
  isRecurring: boolean('is_recurring').default(false),
  recurringData: jsonb('recurring_data').default({}),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  initiatorIdx: index('collab_sessions_initiator_idx').on(table.initiatorId),
  typeIdx: index('collab_sessions_type_idx').on(table.sessionType),
  statusIdx: index('collab_sessions_status_idx').on(table.status),
  scheduledIdx: index('collab_sessions_scheduled_idx').on(table.scheduledTime),
}));

// Research Profiles - Enhanced user profiles for research social network
export const researchProfiles = pgTable('research_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  researchInterests: jsonb('research_interests').default([]), // array of research areas
  expertiseLevel: varchar('expertise_level', { length: 20 }).default('beginner'), // beginner, intermediate, advanced, expert
  fieldsOfStudy: jsonb('fields_of_study').default([]), // academic fields
  currentProjects: jsonb('current_projects').default([]), // active research projects
  achievements: jsonb('achievements').default([]), // badges, certifications, milestones
  collaborationPreferences: jsonb('collaboration_preferences').default({}),
  mentorshipStatus: varchar('mentorship_status', { length: 20 }).default('none'), // mentor, mentee, both, none
  availabilitySchedule: jsonb('availability_schedule').default({}), // timezone and availability
  researchGoals: text('research_goals'),
  bio: text('bio'),
  website: varchar('website', { length: 255 }),
  socialLinks: jsonb('social_links').default({}),
  isPublic: boolean('is_public').default(true),
  featuredPapers: jsonb('featured_papers').default([]),
  researchStats: jsonb('research_stats').default({}), // papers read, experiments run, collaborations
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('research_profiles_user_idx').on(table.userId),
  expertiseIdx: index('research_profiles_expertise_idx').on(table.expertiseLevel),
  mentorshipIdx: index('research_profiles_mentorship_idx').on(table.mentorshipStatus),
}));

// Mentorship Connections
export const mentorshipConnections = pgTable('mentorship_connections', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  mentorId: integer('mentor_id').references(() => users.id, { onDelete: 'cascade' }),
  menteeId: integer('mentee_id').references(() => users.id, { onDelete: 'cascade' }),
  connectionType: varchar('connection_type', { length: 20 }).default('formal'), // formal, informal, peer
  status: varchar('status', { length: 20 }).default('pending'), // pending, active, paused, completed, declined
  focus: jsonb('focus').default([]), // areas of mentorship focus
  meetingSchedule: jsonb('meeting_schedule').default({}),
  goals: text('goals'),
  progress: jsonb('progress').default({}),
  feedback: jsonb('feedback').default([]),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  mentorIdx: index('mentorship_mentor_idx').on(table.mentorId),
  menteeIdx: index('mentorship_mentee_idx').on(table.menteeId),
  statusIdx: index('mentorship_status_idx').on(table.status),
}));

// Research Challenges - Community-driven competitions
export const researchChallenges = pgTable('research_challenges', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  creatorId: integer('creator_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  challengeType: varchar('challenge_type', { length: 50 }).notNull(), // replication, novel_research, improvement, benchmarking
  difficulty: varchar('difficulty', { length: 20 }).default('medium'), // easy, medium, hard, expert
  rewards: jsonb('rewards').default({}), // credits, recognition, prizes
  requirements: jsonb('requirements').default({}), // what participants need to do
  datasets: jsonb('datasets').default([]), // required or suggested datasets
  evaluationCriteria: jsonb('evaluation_criteria').default({}),
  timeline: jsonb('timeline').default({}), // start, milestones, end dates
  participants: jsonb('participants').default([]), // registered participants
  submissions: jsonb('submissions').default([]), // challenge submissions
  status: varchar('status', { length: 20 }).default('open'), // draft, open, running, judging, completed, cancelled
  isTeamChallenge: boolean('is_team_challenge').default(false),
  maxParticipants: integer('max_participants'),
  featuredUntil: timestamp('featured_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('research_challenges_creator_idx').on(table.creatorId),
  typeIdx: index('research_challenges_type_idx').on(table.challengeType),
  statusIdx: index('research_challenges_status_idx').on(table.status),
  difficultyIdx: index('research_challenges_difficulty_idx').on(table.difficulty),
}));

// Voice Interactions - Voice research companion logs
export const voiceInteractions = pgTable('voice_interactions', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }),
  interactionType: varchar('interaction_type', { length: 50 }).notNull(), // question, command, explanation, setup
  audioTranscript: text('audio_transcript'),
  userIntent: varchar('user_intent', { length: 100 }), // explain_paper, setup_experiment, find_papers, etc.
  contextData: jsonb('context_data').default({}), // current paper, experiment, etc.
  aiResponse: text('ai_response'),
  responseType: varchar('response_type', { length: 50 }), // text, audio, action, mixed
  satisfactionRating: integer('satisfaction_rating'), // 1-5 rating from user
  processingTime: integer('processing_time'), // ms to process request
  language: varchar('language', { length: 10 }).default('en'),
  deviceInfo: jsonb('device_info').default({}),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('voice_interactions_user_idx').on(table.userId),
  sessionIdx: index('voice_interactions_session_idx').on(table.sessionId),
  intentIdx: index('voice_interactions_intent_idx').on(table.userIntent),
  createdIdx: index('voice_interactions_created_idx').on(table.createdAt),
}));

// Research Recommendations - AI-powered research suggestions
export const researchRecommendations = pgTable('research_recommendations', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  recommendationType: varchar('recommendation_type', { length: 50 }).notNull(), // paper, collaborator, challenge, trend
  entityId: varchar('entity_id', { length: 255 }).notNull(), // ID of recommended item
  entityType: varchar('entity_type', { length: 50 }).notNull(), // paper, user, challenge, trend
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }), // 0.00-1.00
  reasoning: text('reasoning'), // why this was recommended
  recommendationData: jsonb('recommendation_data').default({}), // additional context
  userAction: varchar('user_action', { length: 20 }), // viewed, liked, dismissed, saved, ignored
  actionTakenAt: timestamp('action_taken_at'),
  isPersonalized: boolean('is_personalized').default(true),
  algorithmVersion: varchar('algorithm_version', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('research_recommendations_user_idx').on(table.userId),
  typeIdx: index('research_recommendations_type_idx').on(table.recommendationType),
  scoreIdx: index('research_recommendations_score_idx').on(table.confidenceScore),
  actionIdx: index('research_recommendations_action_idx').on(table.userAction),
}));

// Experiment Stories - Turn research into engaging narratives
export const experimentStories = pgTable('experiment_stories', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }),
  experimentId: varchar('experiment_id', { length: 255 }),
  paperId: integer('paper_id').references(() => papers.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  story: jsonb('story').notNull(), // structured story with timeline, insights, challenges
  storyType: varchar('story_type', { length: 50 }).default('experiment'), // experiment, discovery, collaboration, journey
  chapters: jsonb('chapters').default([]), // story broken into chapters/sections
  multimedia: jsonb('multimedia').default([]), // images, videos, plots, code snippets
  tags: jsonb('tags').default([]),
  difficulty: varchar('difficulty', { length: 20 }).default('intermediate'),
  estimatedReadTime: integer('estimated_read_time'), // minutes
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  shares: integer('shares').default(0),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  language: varchar('language', { length: 10 }).default('en'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  authorIdx: index('experiment_stories_author_idx').on(table.authorId),
  typeIdx: index('experiment_stories_type_idx').on(table.storyType),
  publishedIdx: index('experiment_stories_published_idx').on(table.isPublished),
  featuredIdx: index('experiment_stories_featured_idx').on(table.isFeatured),
  viewsIdx: index('experiment_stories_views_idx').on(table.views),
}));

// ============================================================================
// ENHANCED RELATIONS FOR REVOLUTIONARY FEATURES
// ============================================================================

export const paperForksRelations = relations(paperForks, ({ one }) => ({
  originalPaper: one(papers, {
    fields: [paperForks.originalPaperId],
    references: [papers.id],
  }),
  forker: one(users, {
    fields: [paperForks.forkerId],
    references: [users.id],
  }),
}));

export const paperDiscussionsRelations = relations(paperDiscussions, ({ one, many }) => ({
  paper: one(papers, {
    fields: [paperDiscussions.paperId],
    references: [papers.id],
  }),
  user: one(users, {
    fields: [paperDiscussions.userId],
    references: [users.id],
  }),
  parent: one(paperDiscussions, {
    fields: [paperDiscussions.parentId],
    references: [paperDiscussions.id],
  }),
  replies: many(paperDiscussions),
}));

export const researchProfilesRelations = relations(researchProfiles, ({ one }) => ({
  user: one(users, {
    fields: [researchProfiles.userId],
    references: [users.id],
  }),
}));

export const mentorshipConnectionsRelations = relations(mentorshipConnections, ({ one }) => ({
  mentor: one(users, {
    fields: [mentorshipConnections.mentorId],
    references: [users.id],
  }),
  mentee: one(users, {
    fields: [mentorshipConnections.menteeId],
    references: [users.id],
  }),
}));

export const researchChallengesRelations = relations(researchChallenges, ({ one }) => ({
  creator: one(users, {
    fields: [researchChallenges.creatorId],
    references: [users.id],
  }),
}));

export const liveExperimentsRelations = relations(liveExperiments, ({ one }) => ({
  owner: one(users, {
    fields: [liveExperiments.ownerId],
    references: [users.id],
  }),
}));

export const collaborationSessionsRelations = relations(collaborationSessions, ({ one }) => ({
  initiator: one(users, {
    fields: [collaborationSessions.initiatorId],
    references: [users.id],
  }),
}));

export const experimentStoriesRelations = relations(experimentStories, ({ one }) => ({
  author: one(users, {
    fields: [experimentStories.authorId],
    references: [users.id],
  }),
  paper: one(papers, {
    fields: [experimentStories.paperId],
    references: [papers.id],
  }),
}));

// Enhanced user relations to include new features
export const enhancedUsersRelations = relations(users, ({ many, one }) => ({
  // Existing relations...
  savedPapers: many(userSavedPapers),
  searchHistory: many(searchHistory),
  annotations: many(annotations),
  ownedNotebooks: many(notebooks),
  notebookCollaborations: many(notebookCollaborators),
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
  summaries: many(paperSummaries),
  
  // New revolutionary features relations
  paperForks: many(paperForks),
  paperDiscussions: many(paperDiscussions),
  researchFeedItems: many(researchFeed),
  liveExperiments: many(liveExperiments),
  collaborationSessions: many(collaborationSessions),
  researchProfile: one(researchProfiles, {
    fields: [users.id],
    references: [researchProfiles.userId],
    relationName: "userResearchProfile"
  }),
  mentorConnections: many(mentorshipConnections, {
    relationName: "mentorConnections"
  }),
  menteeConnections: many(mentorshipConnections, {
    relationName: "menteeConnections"  
  }),
  createdChallenges: many(researchChallenges),
  voiceInteractions: many(voiceInteractions),
  researchRecommendations: many(researchRecommendations),
  experimentStories: many(experimentStories),
}));

// Enhanced paper relations
export const enhancedPapersRelations = relations(papers, ({ many }) => ({
  // Existing relations...
  savedByUsers: many(userSavedPapers),
  annotations: many(annotations),
  summaries: many(paperSummaries),
  
  // New revolutionary features relations
  forks: many(paperForks),
  discussions: many(paperDiscussions),
  experimentStories: many(experimentStories),
}));

// ============================================================================
// TYPE EXPORTS FOR REVOLUTIONARY FEATURES
// ============================================================================

export type PaperFork = typeof paperForks.$inferSelect;
export type InsertPaperFork = typeof paperForks.$inferInsert;
export type PaperDiscussion = typeof paperDiscussions.$inferSelect;
export type InsertPaperDiscussion = typeof paperDiscussions.$inferInsert;
export type ResearchFeedItem = typeof researchFeed.$inferSelect;
export type LiveExperiment = typeof liveExperiments.$inferSelect;

export type MentorshipConnection = typeof mentorshipConnections.$inferSelect;
export type ResearchChallenge = typeof researchChallenges.$inferSelect;
export type InsertResearchChallenge = typeof researchChallenges.$inferInsert;
export type VoiceInteraction = typeof voiceInteractions.$inferSelect;
export type ResearchRecommendation = typeof researchRecommendations.$inferSelect;
export type ExperimentStory = typeof experimentStories.$inferSelect;
export type InsertExperimentStory = typeof experimentStories.$inferInsert;

// Missing insert types for revolutionary features
export type InsertVoiceInteraction = typeof voiceInteractions.$inferInsert;
export type InsertResearchFeedItem = typeof researchFeed.$inferInsert;

// Project and workspace management
export const projects = pgTable('projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull().default('research'), // research, experiment, collaboration, benchmark
  visibility: varchar('visibility', { length: 20 }).notNull().default('private'), // private, team, public
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, paused, completed, archived
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectMembers = pgTable('project_members', {
  id: varchar('id', { length: 255 }).primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // owner, admin, member, viewer
  permissions: jsonb('permissions').notNull().default([]), // ['read', 'write', 'admin', 'delete']
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Enhanced experiment tracking
export const experiments = pgTable('experiments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  projectId: varchar('project_id', { length: 255 }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('training'), // training, evaluation, inference, analysis
  status: varchar('status', { length: 50 }).notNull().default('created'), // created, running, completed, failed, cancelled
  configuration: jsonb('configuration').notNull().default({}), // hyperparameters, datasets, model config
  metadata: jsonb('metadata').default({}), // framework, reproducibility info, tags
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const experimentRuns = pgTable('experiment_runs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  experimentId: varchar('experiment_id', { length: 255 }).notNull(),
  runNumber: integer('run_number').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('running'),
  startTime: timestamp('start_time').defaultNow().notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // in seconds
  parameters: jsonb('parameters').notNull().default({}),
  metrics: jsonb('metrics').default({}),
  artifacts: jsonb('artifacts').default([]),
  logs: text('logs'),
  environment: jsonb('environment').default({}), // git hash, dependencies, hardware
  reproducibilityInfo: jsonb('reproducibility_info').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const experimentArtifacts = pgTable('experiment_artifacts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  experimentId: varchar('experiment_id', { length: 255 }).notNull(),
  runId: varchar('run_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // model, dataset, plot, log, checkpoint
  path: text('path').notNull(),
  size: bigint('size', { mode: 'number' }),
  hash: varchar('hash', { length: 128 }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Benchmarking and evaluation
export const benchmarks = pgTable('benchmarks', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  domain: varchar('domain', { length: 100 }).notNull(), // nlp, cv, ml, rl, etc.
  type: varchar('type', { length: 50 }).notNull(), // classification, regression, generation, etc.
  difficulty: varchar('difficulty', { length: 20 }), // easy, medium, hard, expert
  datasetInfo: jsonb('dataset_info').notNull(),
  evaluationMetrics: jsonb('evaluation_metrics').notNull(),
  baselineResults: jsonb('baseline_results').default([]),
  submissionGuidelines: text('submission_guidelines'),
  isPublic: boolean('is_public').default(true),
  createdBy: varchar('created_by', { length: 255 }),
  version: varchar('version', { length: 20 }).default('1.0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const benchmarkResults = pgTable('benchmark_results', {
  id: varchar('id', { length: 255 }).primaryKey(),
  benchmarkId: varchar('benchmark_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  experimentId: varchar('experiment_id', { length: 255 }),
  modelInfo: jsonb('model_info').notNull(),
  results: jsonb('results').notNull(), // scores, metrics, detailed results
  submissionMetadata: jsonb('submission_metadata').default({}),
  isPublic: boolean('is_public').default(false),
  reproducibilityScore: integer('reproducibility_score'),
  status: varchar('status', { length: 50 }).default('completed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Paper-to-code translation
export const paperCodeGenerations = pgTable('paper_code_generations', {
  id: varchar('id', { length: 255 }).primaryKey(),
  paperId: varchar('paper_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  notebookId: varchar('notebook_id', { length: 255 }),
  extractedMethodology: jsonb('extracted_methodology').notNull(),
  generatedCode: text('generated_code'),
  codeStructure: jsonb('code_structure').default({}),
  placeholders: jsonb('placeholders').default([]),
  confidenceScore: decimal('confidence_score', { precision: 5, scale: 2 }),
  validationResults: jsonb('validation_results').default({}),
  refinementHistory: jsonb('refinement_history').default([]),
  status: varchar('status', { length: 50 }).default('generated'), // generated, refined, validated, deployed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Enhanced notebooks with collaboration features
export const notebookVersions = pgTable('notebook_versions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  notebookId: varchar('notebook_id', { length: 255 }).notNull(),
  versionNumber: integer('version_number').notNull(),
  content: jsonb('content').notNull(),
  changes: text('changes'), // summary of changes
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notebookComments = pgTable('notebook_comments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  notebookId: varchar('notebook_id', { length: 255 }).notNull(),
  cellIndex: integer('cell_index'), // null for notebook-level comments
  lineNumber: integer('line_number'), // for line-specific comments
  userId: varchar('user_id', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).default('comment'), // comment, suggestion, question, approval
  status: varchar('status', { length: 20 }).default('active'), // active, resolved, archived
  parentId: varchar('parent_id', { length: 255 }), // for threaded comments
  mentions: jsonb('mentions').default([]), // mentioned user IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notebook collaboration sessions (different from the global collaboration sessions above)
export const notebookCollaborationSessions = pgTable('notebook_collaboration_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  notebookId: varchar('notebook_id', { length: 255 }).notNull(),
  participants: jsonb('participants').notNull().default([]),
  currentState: jsonb('current_state').notNull(),
  operations: jsonb('operations').default([]), // operational transforms log
  isActive: boolean('is_active').default(true),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

export const collaborationRequests = pgTable('collaboration_requests', {
  id: varchar('id', { length: 255 }).primaryKey(),
  fromUserId: varchar('from_user_id', { length: 255 }).notNull(),
  toUserId: varchar('to_user_id', { length: 255 }).notNull(),
  projectId: varchar('project_id', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull(), // project_invite, expertise_request, mentorship
  message: text('message'),
  metadata: jsonb('metadata').default({}),
  status: varchar('status', { length: 20 }).default('pending'), // pending, accepted, declined, expired
  respondedAt: timestamp('responded_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Enhanced analytics and insights
export const researchAnalytics = pgTable('research_analytics', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  projectId: varchar('project_id', { length: 255 }),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // user, project, paper, experiment
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: jsonb('event_data').default({}),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sessionId: varchar('session_id', { length: 255 }),
});

export const impactMetrics = pgTable('impact_metrics', {
  id: varchar('id', { length: 255 }).primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // user, project, paper, experiment, benchmark
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  metricType: varchar('metric_type', { length: 100 }).notNull(), // citations, reproductions, collaborations, downloads
  value: decimal('value', { precision: 15, scale: 6 }).notNull(),
  metadata: jsonb('metadata').default({}),
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
});

// Relations for new tables
export const projectRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  members: many(projectMembers),
  experiments: many(experiments),
  notebooks: many(notebooks),
}));

export const projectMemberRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const experimentRelations = relations(experiments, ({ one, many }) => ({
  project: one(projects, {
    fields: [experiments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [experiments.userId],
    references: [users.id],
  }),
  runs: many(experimentRuns),
  artifacts: many(experimentArtifacts),
}));

export const experimentRunRelations = relations(experimentRuns, ({ one, many }) => ({
  experiment: one(experiments, {
    fields: [experimentRuns.experimentId],
    references: [experiments.id],
  }),
  artifacts: many(experimentArtifacts),
}));

export const benchmarkRelations = relations(benchmarks, ({ one, many }) => ({
  creator: one(users, {
    fields: [benchmarks.createdBy],
    references: [users.id],
  }),
  results: many(benchmarkResults),
}));

export const benchmarkResultRelations = relations(benchmarkResults, ({ one }) => ({
  benchmark: one(benchmarks, {
    fields: [benchmarkResults.benchmarkId],
    references: [benchmarks.id],
  }),
  user: one(users, {
    fields: [benchmarkResults.userId],
    references: [users.id],
  }),
  experiment: one(experiments, {
    fields: [benchmarkResults.experimentId],
    references: [experiments.id],
  }),
}));

export const paperCodeGenerationRelations = relations(paperCodeGenerations, ({ one }) => ({
  paper: one(papers, {
    fields: [paperCodeGenerations.paperId],
    references: [papers.id],
  }),
  user: one(users, {
    fields: [paperCodeGenerations.userId],
    references: [users.id],
  }),
  notebook: one(notebooks, {
    fields: [paperCodeGenerations.notebookId],
    references: [notebooks.id],
  }),
}));

export const notebookVersionRelations = relations(notebookVersions, ({ one }) => ({
  notebook: one(notebooks, {
    fields: [notebookVersions.notebookId],
    references: [notebooks.id],
  }),
  creator: one(users, {
    fields: [notebookVersions.createdBy],
    references: [users.id],
  }),
}));

export const notebookCommentRelations = relations(notebookComments, ({ one, many }) => ({
  notebook: one(notebooks, {
    fields: [notebookComments.notebookId],
    references: [notebooks.id],
  }),
  user: one(users, {
    fields: [notebookComments.userId],
    references: [users.id],
  }),
  parent: one(notebookComments, {
    fields: [notebookComments.parentId],
    references: [notebookComments.id],
  }),
  replies: many(notebookComments),
}));

export const collaborationSessionRelations = relations(collaborationSessions, ({ one }) => ({
  initiator: one(users, {
    fields: [collaborationSessions.initiatorId],
    references: [users.id],
  }),
}));

export const researchProfileRelations = relations(researchProfiles, ({ one }) => ({
  user: one(users, {
    fields: [researchProfiles.userId],
    references: [users.id],
  }),
}));

export const collaborationRequestRelations = relations(collaborationRequests, ({ one }) => ({
  fromUser: one(users, {
    fields: [collaborationRequests.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [collaborationRequests.toUserId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [collaborationRequests.projectId],
    references: [projects.id],
  }),
}));

// Extended type exports
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;
export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = typeof experiments.$inferInsert;
export type ExperimentRun = typeof experimentRuns.$inferSelect;
export type InsertExperimentRun = typeof experimentRuns.$inferInsert;
export type Benchmark = typeof benchmarks.$inferSelect;
export type InsertBenchmark = typeof benchmarks.$inferInsert;
export type BenchmarkResult = typeof benchmarkResults.$inferSelect;
export type InsertBenchmarkResult = typeof benchmarkResults.$inferInsert;
export type PaperCodeGeneration = typeof paperCodeGenerations.$inferSelect;
export type InsertPaperCodeGeneration = typeof paperCodeGenerations.$inferInsert;
export type NotebookVersion = typeof notebookVersions.$inferSelect;
export type InsertNotebookVersion = typeof notebookVersions.$inferInsert;
export type NotebookComment = typeof notebookComments.$inferSelect;
export type InsertNotebookComment = typeof notebookComments.$inferInsert;
export type InsertCollaborationSession = typeof collaborationSessions.$inferInsert;
export type CollaborationRequest = typeof collaborationRequests.$inferSelect;
export type InsertCollaborationRequest = typeof collaborationRequests.$inferInsert;
