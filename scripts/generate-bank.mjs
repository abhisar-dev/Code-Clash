import fs from 'fs';
import path from 'path';

// Definition of raw problem data
export const rawProblems = [
  // ==================== 1. ARRAYS & HASHING ====================
  {
    id: 'two-sum',
    slug: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '52.4%',
    functionName: 'twoSum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, so return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists.'],
    pySig: 'def twoSum(self, nums: list[int], target: int) -> list[int]:',
    cppSig: 'vector<int> twoSum(vector<int>& nums, int target)',
    javaSig: 'public int[] twoSum(int[] nums, int target)',
    jsSig: 'function twoSum(nums, target)',
    testCases: [
      { id: 1, input: '[[2,7,11,15], 9]', expectedOutput: '[0,1]', isHidden: false },
      { id: 2, input: '[[3,2,4], 6]', expectedOutput: '[1,2]', isHidden: false },
      { id: 3, input: '[[3,3], 6]', expectedOutput: '[0,1]', isHidden: false },
      { id: 4, input: '[[1,5,8,12,19], 27]', expectedOutput: '[2,4]', isHidden: true },
      { id: 5, input: '[[-1,-2,-3,-4,-5], -8]', expectedOutput: '[2,4]', isHidden: true }
    ]
  },
  {
    id: 'contains-duplicate',
    slug: 'contains-duplicate',
    title: '217. Contains Duplicate',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '61.8%',
    functionName: 'containsDuplicate',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
      { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    pySig: 'def containsDuplicate(self, nums: list[int]) -> bool:',
    cppSig: 'bool containsDuplicate(vector<int>& nums)',
    javaSig: 'public boolean containsDuplicate(int[] nums)',
    jsSig: 'function containsDuplicate(nums)',
    testCases: [
      { id: 1, input: '[[1,2,3,1]]', expectedOutput: 'true', isHidden: false },
      { id: 2, input: '[[1,2,3,4]]', expectedOutput: 'false', isHidden: false },
      { id: 3, input: '[[1,1,1,3,3,4,3,2,4,2]]', expectedOutput: 'true', isHidden: false },
      { id: 4, input: '[[99]]', expectedOutput: 'false', isHidden: true },
      { id: 5, input: '[[5,10,15,20,5]]', expectedOutput: 'true', isHidden: true }
    ]
  },
  {
    id: 'valid-anagram',
    slug: 'valid-anagram',
    title: '242. Valid Anagram',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '64.2%',
    functionName: 'isAnagram',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    pySig: 'def isAnagram(self, s: str, t: str) -> bool:',
    cppSig: 'bool isAnagram(string s, string t)',
    javaSig: 'public boolean isAnagram(String s, String t)',
    jsSig: 'function isAnagram(s, t)',
    testCases: [
      { id: 1, input: '["anagram", "nagaram"]', expectedOutput: 'true', isHidden: false },
      { id: 2, input: '["rat", "car"]', expectedOutput: 'false', isHidden: false },
      { id: 3, input: '["a", "a"]', expectedOutput: 'true', isHidden: false },
      { id: 4, input: '["ab", "a"]', expectedOutput: 'false', isHidden: true },
      { id: 5, input: '["listen", "silent"]', expectedOutput: 'true', isHidden: true }
    ]
  },
  {
    id: 'group-anagrams',
    slug: 'group-anagrams',
    title: '49. Group Anagrams',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    points: 250,
    acceptanceRate: '68.1%',
    functionName: 'groupAnagrams',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' }
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
    pySig: 'def groupAnagrams(self, strs: list[str]) -> list[list[str]]:',
    cppSig: 'vector<vector<string>> groupAnagrams(vector<string>& strs)',
    javaSig: 'public List<List<String>> groupAnagrams(String[] strs)',
    jsSig: 'function groupAnagrams(strs)',
    testCases: [
      { id: 1, input: '[["eat","tea","tan","ate","nat","bat"]]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', isHidden: false },
      { id: 2, input: '[[""]]', expectedOutput: '[[""]]', isHidden: false },
      { id: 3, input: '[["a"]]', expectedOutput: '[["a"]]', isHidden: false },
      { id: 4, input: '[["ab","ba","abc","cba"]]', expectedOutput: '[["ab","ba"],["abc","cba"]]', isHidden: true }
    ]
  },
  {
    id: 'top-k-frequent-elements',
    slug: 'top-k-frequent-elements',
    title: '347. Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    points: 250,
    acceptanceRate: '62.9%',
    functionName: 'topKFrequent',
    description: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' }
    ],
    constraints: ['1 <= nums.length <= 10^5', 'k is in the range [1, the number of unique elements in the array].'],
    pySig: 'def topKFrequent(self, nums: list[int], k: int) -> list[int]:',
    cppSig: 'vector<int> topKFrequent(vector<int>& nums, int k)',
    javaSig: 'public int[] topKFrequent(int[] nums, int k)',
    jsSig: 'function topKFrequent(nums, k)',
    testCases: [
      { id: 1, input: '[[1,1,1,2,2,3], 2]', expectedOutput: '[1,2]', isHidden: false },
      { id: 2, input: '[[1], 1]', expectedOutput: '[1]', isHidden: false },
      { id: 3, input: '[[4,1,-1,2,-1,2,3], 2]', expectedOutput: '[-1,2]', isHidden: true }
    ]
  },
  {
    id: 'product-of-array-except-self',
    slug: 'product-of-array-except-self',
    title: '238. Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    points: 250,
    acceptanceRate: '65.4%',
    functionName: 'productExceptSelf',
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }
    ],
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30'],
    pySig: 'def productExceptSelf(self, nums: list[int]) -> list[int]:',
    cppSig: 'vector<int> productExceptSelf(vector<int>& nums)',
    javaSig: 'public int[] productExceptSelf(int[] nums)',
    jsSig: 'function productExceptSelf(nums)',
    testCases: [
      { id: 1, input: '[[1,2,3,4]]', expectedOutput: '[24,12,8,6]', isHidden: false },
      { id: 2, input: '[[-1,1,0,-3,3]]', expectedOutput: '[0,0,9,0,0]', isHidden: false },
      { id: 3, input: '[[2,3]]', expectedOutput: '[3,2]', isHidden: true }
    ]
  },
  {
    id: 'longest-consecutive-sequence',
    slug: 'longest-consecutive-sequence',
    title: '128. Longest Consecutive Sequence',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    points: 250,
    acceptanceRate: '47.5%',
    functionName: 'longestConsecutive',
    description: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.',
    examples: [
      { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.' },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' }
    ],
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    pySig: 'def longestConsecutive(self, nums: list[int]) -> int:',
    cppSig: 'int longestConsecutive(vector<int>& nums)',
    javaSig: 'public int longestConsecutive(int[] nums)',
    jsSig: 'function longestConsecutive(nums)',
    testCases: [
      { id: 1, input: '[[100,4,200,1,3,2]]', expectedOutput: '4', isHidden: false },
      { id: 2, input: '[[0,3,7,2,5,8,4,6,0,1]]', expectedOutput: '9', isHidden: false },
      { id: 3, input: '[[]]', expectedOutput: '0', isHidden: true }
    ]
  },
  {
    id: 'remove-element',
    slug: 'remove-element',
    title: '27. Remove Element',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '56.9%',
    functionName: 'removeElement',
    description: 'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place. The order of the elements may be changed. Then return the number of elements in nums which are not equal to val.',
    examples: [
      { input: 'nums = [3,2,2,3], val = 3', output: '2' },
      { input: 'nums = [0,1,2,2,3,0,4,2], val = 2', output: '5' }
    ],
    constraints: ['0 <= nums.length <= 100', '0 <= nums[i] <= 50', '0 <= val <= 100'],
    pySig: 'def removeElement(self, nums: list[int], val: int) -> int:',
    cppSig: 'int removeElement(vector<int>& nums, int val)',
    javaSig: 'public int removeElement(int[] nums, int val)',
    jsSig: 'function removeElement(nums, val)',
    testCases: [
      { id: 1, input: '[[3,2,2,3], 3]', expectedOutput: '2', isHidden: false },
      { id: 2, input: '[[0,1,2,2,3,0,4,2], 2]', expectedOutput: '5', isHidden: false },
      { id: 3, input: '[[], 0]', expectedOutput: '0', isHidden: true }
    ]
  },
  {
    id: 'remove-duplicates-from-sorted-array',
    slug: 'remove-duplicates-from-sorted-array',
    title: '26. Remove Duplicates from Sorted Array',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '55.3%',
    functionName: 'removeDuplicates',
    description: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in nums.',
    examples: [
      { input: 'nums = [1,1,2]', output: '2' },
      { input: 'nums = [0,0,1,1,1,2,2,3,3,4]', output: '5' }
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', '-100 <= nums[i] <= 100', 'nums is sorted in non-decreasing order.'],
    pySig: 'def removeDuplicates(self, nums: list[int]) -> int:',
    cppSig: 'int removeDuplicates(vector<int>& nums)',
    javaSig: 'public int removeDuplicates(int[] nums)',
    jsSig: 'function removeDuplicates(nums)',
    testCases: [
      { id: 1, input: '[[1,1,2]]', expectedOutput: '2', isHidden: false },
      { id: 2, input: '[[0,0,1,1,1,2,2,3,3,4]]', expectedOutput: '5', isHidden: false },
      { id: 3, input: '[[1]]', expectedOutput: '1', isHidden: true }
    ]
  },
  {
    id: 'valid-sudoku',
    slug: 'valid-sudoku',
    title: '36. Valid Sudoku',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    points: 250,
    acceptanceRate: '59.2%',
    functionName: 'isValidSudoku',
    description: 'Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the standard Sudoku rules: each row must contain 1-9 without repetition, each column must contain 1-9 without repetition, each of the nine 3x3 sub-boxes must contain 1-9 without repetition.',
    examples: [
      { input: 'board = [["5","3",".",".","7",".",".",".","."],...]', output: 'true' }
    ],
    constraints: ['board.length == 9', 'board[i].length == 9', 'board[i][j] is a digit 1-9 or \'.\'.'],
    pySig: 'def isValidSudoku(self, board: list[list[str]]) -> bool:',
    cppSig: 'bool isValidSudoku(vector<vector<char>>& board)',
    javaSig: 'public boolean isValidSudoku(char[][] board)',
    jsSig: 'function isValidSudoku(board)',
    testCases: [
      { id: 1, input: '[[["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]]', expectedOutput: 'true', isHidden: false },
      { id: 2, input: '[[["8","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]]', expectedOutput: 'false', isHidden: false },
      { id: 3, input: '[[[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."]]]', expectedOutput: 'true', isHidden: true }
    ]
  },
  {
    id: 'first-missing-positive',
    slug: 'first-missing-positive',
    title: '41. First Missing Positive',
    difficulty: 'Hard',
    category: 'Arrays & Hashing',
    points: 500,
    acceptanceRate: '37.8%',
    functionName: 'firstMissingPositive',
    description: 'Given an unsorted integer array nums, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.',
    examples: [
      { input: 'nums = [1,2,0]', output: '3' },
      { input: 'nums = [3,4,-1,1]', output: '2' },
      { input: 'nums = [7,8,9,11,12]', output: '1' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-2^31 <= nums[i] <= 2^31 - 1'],
    pySig: 'def firstMissingPositive(self, nums: list[int]) -> int:',
    cppSig: 'int firstMissingPositive(vector<int>& nums)',
    javaSig: 'public int firstMissingPositive(int[] nums)',
    jsSig: 'function firstMissingPositive(nums)',
    testCases: [
      { id: 1, input: '[[1,2,0]]', expectedOutput: '3', isHidden: false },
      { id: 2, input: '[[3,4,-1,1]]', expectedOutput: '2', isHidden: false },
      { id: 3, input: '[[7,8,9,11,12]]', expectedOutput: '1', isHidden: false },
      { id: 4, input: '[[1]]', expectedOutput: '2', isHidden: true },
      { id: 5, input: '[[2]]', expectedOutput: '1', isHidden: true }
    ]
  },
  {
    id: 'majority-element',
    slug: 'majority-element',
    title: '169. Majority Element',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '64.5%',
    functionName: 'majorityElement',
    description: 'Given an array nums of size n, return the majority element. The majority element is the element that appears more than ⌊n / 2⌋ times.',
    examples: [
      { input: 'nums = [3,2,3]', output: '3' },
      { input: 'nums = [2,2,1,1,1,2,2]', output: '2' }
    ],
    constraints: ['n == nums.length', '1 <= n <= 5 * 10^4', '-10^9 <= nums[i] <= 10^9'],
    pySig: 'def majorityElement(self, nums: list[int]) -> int:',
    cppSig: 'int majorityElement(vector<int>& nums)',
    javaSig: 'public int majorityElement(int[] nums)',
    jsSig: 'function majorityElement(nums)',
    testCases: [
      { id: 1, input: '[[3,2,3]]', expectedOutput: '3', isHidden: false },
      { id: 2, input: '[[2,2,1,1,1,2,2]]', expectedOutput: '2', isHidden: false },
      { id: 3, input: '[[1]]', expectedOutput: '1', isHidden: true }
    ]
  },
  {
    id: 'subarray-sum-equals-k',
    slug: 'subarray-sum-equals-k',
    title: '560. Subarray Sum Equals K',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    points: 250,
    acceptanceRate: '43.9%',
    functionName: 'subarraySum',
    description: 'Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.',
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2' },
      { input: 'nums = [1,2,3], k = 3', output: '2' }
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
    pySig: 'def subarraySum(self, nums: list[int], k: int) -> int:',
    cppSig: 'int subarraySum(vector<int>& nums, int k)',
    javaSig: 'public int subarraySum(int[] nums, int k)',
    jsSig: 'function subarraySum(nums, k)',
    testCases: [
      { id: 1, input: '[[1,1,1], 2]', expectedOutput: '2', isHidden: false },
      { id: 2, input: '[[1,2,3], 3]', expectedOutput: '2', isHidden: false },
      { id: 3, input: '[[1,-1,0], 0]', expectedOutput: '3', isHidden: true }
    ]
  },
  {
    id: 'contains-duplicate-ii',
    slug: 'contains-duplicate-ii',
    title: '219. Contains Duplicate II',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '45.1%',
    functionName: 'containsNearbyDuplicate',
    description: 'Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and abs(i - j) <= k.',
    examples: [
      { input: 'nums = [1,2,3,1], k = 3', output: 'true' },
      { input: 'nums = [1,0,1,1], k = 1', output: 'true' },
      { input: 'nums = [1,2,3,1,2,3], k = 2', output: 'false' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9', '0 <= k <= 10^5'],
    pySig: 'def containsNearbyDuplicate(self, nums: list[int], k: int) -> bool:',
    cppSig: 'bool containsNearbyDuplicate(vector<int>& nums, int k)',
    javaSig: 'public boolean containsNearbyDuplicate(int[] nums, int k)',
    jsSig: 'function containsNearbyDuplicate(nums, k)',
    testCases: [
      { id: 1, input: '[[1,2,3,1], 3]', expectedOutput: 'true', isHidden: false },
      { id: 2, input: '[[1,0,1,1], 1]', expectedOutput: 'true', isHidden: false },
      { id: 3, input: '[[1,2,3,1,2,3], 2]', expectedOutput: 'false', isHidden: false },
      { id: 4, input: '[[1], 1]', expectedOutput: 'false', isHidden: true }
    ]
  },
  {
    id: 'find-all-numbers-disappeared-in-an-array',
    slug: 'find-all-numbers-disappeared-in-an-array',
    title: '448. Find All Numbers Disappeared in an Array',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    points: 100,
    acceptanceRate: '60.7%',
    functionName: 'findDisappearedNumbers',
    description: 'Given an array nums of n integers where nums[i] is in the range [1, n], return an array of all the integers in the range [1, n] that do not appear in nums.',
    examples: [
      { input: 'nums = [4,3,2,7,8,2,3,1]', output: '[5,6]' },
      { input: 'nums = [1,1]', output: '[2]' }
    ],
    constraints: ['n == nums.length', '1 <= n <= 10^5', '1 <= nums[i] <= n'],
    pySig: 'def findDisappearedNumbers(self, nums: list[int]) -> list[int]:',
    cppSig: 'vector<int> findDisappearedNumbers(vector<int>& nums)',
    javaSig: 'public List<Integer> findDisappearedNumbers(int[] nums)',
    jsSig: 'function findDisappearedNumbers(nums)',
    testCases: [
      { id: 1, input: '[[4,3,2,7,8,2,3,1]]', expectedOutput: '[5,6]', isHidden: false },
      { id: 2, input: '[[1,1]]', expectedOutput: '[2]', isHidden: false },
      { id: 3, input: '[[2,2]]', expectedOutput: '[1]', isHidden: true }
    ]
  },
  {
    id: 'sort-colors',
    slug: 'sort-colors',
    title: '75. Sort Colors',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    points: 250,
    acceptanceRate: '63.2%',
    functionName: 'sortColors',
    description: 'Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red (0), white (1), and blue (2). Return the sorted array.',
    examples: [
      { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' },
      { input: 'nums = [2,0,1]', output: '[0,1,2]' }
    ],
    constraints: ['n == nums.length', '1 <= n <= 300', 'nums[i] is either 0, 1, or 2.'],
    pySig: 'def sortColors(self, nums: list[int]) -> list[int]:',
    cppSig: 'vector<int> sortColors(vector<int>& nums)',
    javaSig: 'public int[] sortColors(int[] nums)',
    jsSig: 'function sortColors(nums)',
    testCases: [
      { id: 1, input: '[[2,0,2,1,1,0]]', expectedOutput: '[0,0,1,1,2,2]', isHidden: false },
      { id: 2, input: '[[2,0,1]]', expectedOutput: '[0,1,2]', isHidden: false },
      { id: 3, input: '[[0]]', expectedOutput: '[0]', isHidden: true }
    ]
  }
];

console.log(`Defined base problems: ${rawProblems.length}`);
