---
# Documentation: https://wowchemy.com/docs/managing-content/

title: Regression Models for Count Data in R
subtitle: ''
summary: ''
authors:
- Achim Zeileis
- Christian Kleiber
- Simon Jackman
tags: []
categories: []
date: '2008-07-01'
lastmod: 2022-11-18T08:54:46+11:00
featured: false
draft: false

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
# Focal points: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight.
image:
  caption: ''
  focal_point: ''
  preview_only: false

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects: []
publishDate: '2022-11-17T21:54:46.528141Z'
publication_types:
- '2'
abstract: The classical Poisson, geometric and negative binomial regression models
  for count data belong to the family of generalized linear models and are available
  at the core of the statistics toolbox in the R system for statistical computing.
  After reviewing the conceptual and computational features of these methods, a new
  implementation of hurdle and zero-inflated regression models in the functions &lt;code&gt;hurdle()&lt;/code&gt;
  and &lt;code&gt;zeroinfl()&lt;/code&gt; from the package &lt;b&gt;pscl&lt;/b&gt;
  is introduced. It re-uses design and functionality of the basic R functions just
  as the underlying conceptual tools extend the classical models. Both hurdle and
  zero-inflated model, are able to incorporate over-dispersion and excess zeros-two
  problems that typically occur in count data sets in economics and the social sciences-better
  than their classical counterparts. Using cross-section data on the demand for medical
  care, it is illustrated how the classical as well as the zero-augmented models can
  be fitted, inspected and tested in practice.
publication: '*Journal of Statistical Software*'
doi: 10.18637/jss.v027.i08
---
